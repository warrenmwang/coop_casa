package validation

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/utils"
	"errors"
	"fmt"
	"time"

	goaway "github.com/TwiN/go-away"
	"github.com/google/uuid"
)

func ValidateCommunity(community database.CommunityFullInternal) error {
	// Ensure that admin user id is a userid of the community
	var flag bool = false
	for _, userID := range community.CommunityUsers {
		if userID == community.CommunityDetails.AdminUserID {
			flag = true
		}
	}
	if !flag {
		return errors.New("expected admin user id in community users list but is not")
	}
	// Validate community details
	err := ValidateCommunity(community)
	if err != nil {
		return err
	}

	return nil
}

func ValidateCommunityDetails(details database.CommunityDetails) error {
	if _, err := uuid.Parse(details.CommunityID); err != nil {
		return errors.New("communityId is not a valid uuid")
	}

	// Admin user id is expected to be an oauth openid string
	// which at the time of writing only contains numeric values
	// and is what we will expect.
	if len(details.AdminUserID) == 0 {
		return errors.New("adminUserId cannot be empty string")
	}
	isOnlyNumbers := true
	for _, c := range details.AdminUserID {
		if c < '0' || c > '9' {
			isOnlyNumbers = false
			break
		}
	}
	if !isOnlyNumbers {
		return errors.New("adminUserId is not only numbers, which is expected content of oauth openid id")
	}

	// Validate name
	if len(details.Name) == 0 {
		return errors.New("name cannot be empty string")
	}
	if goaway.IsProfane(details.Name) {
		return errors.New(fmt.Sprintf("name cannot contain profanity: %s", goaway.ExtractProfanity(details.Name)))
	}

	// Validate description
	if len(details.Description) > 0 {
		if goaway.IsProfane(details.Description) {
			return errors.New(fmt.Sprintf("description cannot contain profanity: %s", goaway.ExtractProfanity(details.Description)))
		}
	}

	return nil
}

func ValidatePropertyDetails(propertyDetails database.PropertyDetails) error {
	// Ensure property id is a valid uuidv4
	if _, err := uuid.Parse(propertyDetails.PropertyID); err != nil {
		return errors.New("property id is not a valid uuid")
	}

	// Ensure lister id is present
	if len(propertyDetails.ListerUserID) == 0 {
		return errors.New("property's lister id is empty")
	}
	isOnlyNumbers := true
	for _, c := range propertyDetails.ListerUserID {
		if c < '0' || c > '9' {
			isOnlyNumbers = false
			break
		}
	}
	if !isOnlyNumbers {
		return errors.New("listerUserId is not only numbers, which is expected content of oauth openid id")
	}

	// Ensure important fields are not empty, out of expected range, or contain profanity
	if len(propertyDetails.Name) == 0 {
		return errors.New("name cannot be empty")
	}
	if goaway.IsProfane(propertyDetails.Name) {
		return fmt.Errorf("name cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Name))
	}

	if len(propertyDetails.City) == 0 {
		return errors.New("city cannot be empty")
	}
	if goaway.IsProfane(propertyDetails.City) {
		return fmt.Errorf("city cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.City))
	}

	if len(propertyDetails.State) == 0 {
		return errors.New("state is invalid")
	}
	if goaway.IsProfane(propertyDetails.State) {
		return fmt.Errorf("state cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.State))
	}

	if len(propertyDetails.Zipcode) == 0 {
		return errors.New("zipcode is invalid")
	}
	if goaway.IsProfane(propertyDetails.Zipcode) {
		return fmt.Errorf("zipcode cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Zipcode))
	}

	if len(propertyDetails.Country) == 0 {
		return errors.New("country is invalid")
	}
	if goaway.IsProfane(propertyDetails.Country) {
		return fmt.Errorf("country cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Country))
	}

	if v := propertyDetails.Square_feet; v <= 0 || v > 999999999 {
		return errors.New("square feet invalid")
	}

	if v := propertyDetails.Num_bedrooms; v < 0 || v > 32767 {
		return errors.New("number of bedrooms invalid")
	}

	if v := propertyDetails.Num_toilets; v < 0 || v > 32767 {
		return errors.New("number of toilets invalid")
	}

	if v := propertyDetails.Num_showers_baths; v < 0 || v > 32767 {
		return errors.New("number of showers/baths invalid")
	}

	if v := propertyDetails.Cost_dollars; v <= 0 || v > 999999999999 {
		return errors.New("cost in dollars invalid")
	}

	if v := propertyDetails.Cost_cents; v < 0 || v > 99 {
		return errors.New("cost in cents invalid")
	}

	return nil
}

func ValidateUserDetails(userDetails database.UserDetails) error {
	// Ensure id field is present and valid
	if len(userDetails.UserID) == 0 {
		return errors.New("user id is empty")
	}
	isOnlyNumbers := true
	for _, c := range userDetails.UserID {
		if c < '0' || c > '9' {
			isOnlyNumbers = false
			break
		}
	}
	if !isOnlyNumbers {
		return errors.New("user id is not only numbers, which is expected content of oauth openid id")
	}

	// Ensure email is a proper email
	if !utils.IsValidEmail(userDetails.Email) {
		return errors.New("email is not valid")
	}

	// Validate name fields
	if len(userDetails.FirstName) == 0 {
		return errors.New("first name is empty")
	}
	if goaway.IsProfane(userDetails.FirstName) {
		return fmt.Errorf("first name cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.FirstName))
	}

	if len(userDetails.LastName) == 0 {
		return errors.New("last name is empty")
	}
	if goaway.IsProfane(userDetails.LastName) {
		return fmt.Errorf("last name cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.LastName))
	}

	// Ensure user is more than 18 years of age
	layout := "2006-01-02"
	birthDateTime, err := time.Parse(layout, userDetails.BirthDate)
	if err != nil {
		return err
	}

	now := time.Now()
	ageYears := now.Year() - birthDateTime.Year()
	if now.YearDay() < birthDateTime.Day() {
		ageYears--
	}

	if ageYears < 18 {
		return errors.New("user not required minimum age of 18")
	}

	// Validate rest of required fields
	if len(userDetails.Gender) == 0 {
		return errors.New("gender is empty")
	}
	if goaway.IsProfane(userDetails.Gender) {
		return fmt.Errorf("gender cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.Gender))
	}
	// Ensure inputted gender is an option we support
	if _, exists := config.GENDER_OPTIONS[userDetails.Gender]; !exists {
		return fmt.Errorf("gender is not one of our supported options: %s", userDetails.Gender)
	}

	if len(userDetails.Location) == 0 {
		return errors.New("location is empty")
	}
	if goaway.IsProfane(userDetails.Location) {
		return fmt.Errorf("location cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.Location))
	}

	// Validate that interests string is formatted correctly
	// (comma separated of currently existing strings)
	if len(userDetails.Interests) == 0 {
		return errors.New("interests is empty")
	}
	// Validate each interest, no profanity, and is an interest we currently support
	for _, interest := range userDetails.Interests {
		if goaway.IsProfane(interest) {
			return fmt.Errorf("interest \"%s\" contains profanity: %s", interest, goaway.ExtractProfanity(interest))
		}
		if _, exists := config.INTERESTS_OPTIONS[interest]; !exists {
			return fmt.Errorf("interest \"%s\" is not one of our supported options", interest)
		}
	}

	return nil
}
