// Package validation contains functions to validate user inputs.
package validation

import (
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/utils"
	"errors"
	"fmt"
	"net/mail"
	"regexp"
	"strings"

	goaway "github.com/TwiN/go-away"
	"github.com/google/uuid"
)

func ValidateEmail(email string) bool {
	/* Emails must pass 2 checks:
	   1. stdlib's mail parser.
	   2. custom regex ripped from stackoverflow.
	*/
	const emailRegexPattern = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegexPattern)
	regexRes := re.MatchString(email)

	_, err := mail.ParseAddress(email)
	mailParseRes := err == nil

	return regexRes && mailParseRes
}

func ValidateOpenID(id string, idName string) error {
	if len(id) != 21 {
		return fmt.Errorf("%s is not of the right length, expected to be 21 chars long", idName)
	}
	isOnlyNumbers := true
	for _, c := range id {
		if c < '0' || c > '9' {
			isOnlyNumbers = false
			break
		}
	}
	if !isOnlyNumbers {
		return fmt.Errorf("%s is not only numbers, which is expected content of oauth openid id", idName)
	}
	return nil
}

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
	err := ValidateCommunityDetails(community.CommunityDetails)
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
	if err := ValidateOpenID(details.AdminUserID, "admin id"); err != nil {
		return err
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
	if err := ValidateOpenID(propertyDetails.ListerUserID, "lister id"); err != nil {
		return err
	}

	// Ensure required fields are not empty, numeric fields should not be out of expected range
	// all text fields should not contain profanity

	// Property Name
	if len(propertyDetails.Name) == 0 {
		return errors.New("name cannot be empty")
	}
	if goaway.IsProfane(propertyDetails.Name) {
		return fmt.Errorf("name cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Name))
	}

	// Property Description
	if goaway.IsProfane(propertyDetails.Description) {
		return fmt.Errorf("description cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Description))
	}

	// Address 1
	if len(propertyDetails.Address_1) == 0 {
		return errors.New("address 1 cannot be empty")
	}
	if goaway.IsProfane(propertyDetails.Address_1) {
		return fmt.Errorf("address 1 cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Address_1))
	}

	// Address 2
	if goaway.IsProfane(propertyDetails.Address_2) {
		return fmt.Errorf("address 2 cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Address_2))
	}

	// City
	if len(propertyDetails.City) == 0 {
		return errors.New("city cannot be empty")
	}
	if goaway.IsProfane(propertyDetails.City) {
		return fmt.Errorf("city cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.City))
	}

	// State
	if len(propertyDetails.State) == 0 {
		return errors.New("state is invalid")
	}
	if goaway.IsProfane(propertyDetails.State) {
		return fmt.Errorf("state cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.State))
	}

	// Zipcode
	if len(propertyDetails.Zipcode) == 0 {
		return errors.New("zipcode is invalid")
	}
	if goaway.IsProfane(propertyDetails.Zipcode) {
		return fmt.Errorf("zipcode cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Zipcode))
	}

	// Country
	if len(propertyDetails.Country) == 0 {
		return errors.New("country is invalid")
	}
	if goaway.IsProfane(propertyDetails.Country) {
		return fmt.Errorf("country cannot contain profanity: %s", goaway.ExtractProfanity(propertyDetails.Country))
	}

	// Square Feet
	if v := propertyDetails.Square_feet; v <= 0 || v > 999999999 {
		return errors.New("square feet invalid")
	}

	// Number of Bedrooms
	if v := propertyDetails.Num_bedrooms; v < 0 || v > 32767 {
		return errors.New("number of bedrooms invalid")
	}

	// Number of Toilets
	if v := propertyDetails.Num_toilets; v < 0 || v > 32767 {
		return errors.New("number of toilets invalid")
	}

	// Number of Showers and Baths
	if v := propertyDetails.Num_showers_baths; v < 0 || v > 32767 {
		return errors.New("number of showers/baths invalid")
	}

	// Cost in Dollars
	if v := propertyDetails.Cost_dollars; v <= 0 || v > 999999999999 {
		return errors.New("cost in dollars invalid")
	}

	// Cost in Cents
	if v := propertyDetails.Cost_cents; v < 0 || v > 99 {
		return errors.New("cost in cents invalid")
	}

	return nil
}

func ValidateUserDetails(userDetails database.UserDetails) error {
	// Ensure id field is present and valid
	if err := ValidateOpenID(userDetails.UserID, "user id"); err != nil {
		return err
	}

	// Ensure email is a proper email
	if !ValidateEmail(userDetails.Email) {
		return errors.New("email is not valid")
	}

	// Validate name fields
	if len(strings.TrimSpace(userDetails.FirstName)) == 0 {
		return errors.New("first name is empty")
	}
	if goaway.IsProfane(userDetails.FirstName) {
		return fmt.Errorf("first name cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.FirstName))
	}

	if len(strings.TrimSpace(userDetails.LastName)) == 0 {
		return errors.New("last name is empty")
	}
	if goaway.IsProfane(userDetails.LastName) {
		return fmt.Errorf("last name cannot contain profanity: %s", goaway.ExtractProfanity(userDetails.LastName))
	}

	// Ensure user is more than 18 years of age
	ageYears, err := utils.CalculateAge(userDetails.BirthDate)
	if err != nil {
		return err
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

	if len(strings.TrimSpace(userDetails.Location)) == 0 {
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
		if profaneWord := goaway.ExtractProfanity(interest); profaneWord != "" {
			return fmt.Errorf("interest \"%s\" contains profanity: %s", interest, profaneWord)
		}
		if _, exists := config.INTERESTS_OPTIONS[interest]; !exists {
			return fmt.Errorf("interest \"%s\" is not one of our supported options", interest)
		}
	}

	return nil
}

func ValidateUserStatusData(status database.UserStatus) error {
	// User account id
	if err := ValidateOpenID(status.UserID, "user id"); err != nil {
		return err
	}

	// Setter account id
	if err := ValidateOpenID(status.SetterUserID, "setter user id"); err != nil {
		return err
	}

	// Status
	if len(status.Status) == 0 {
		return errors.New("status cannot be empty")
	}
	if _, exists := config.USER_STATUS_OPTIONS[status.Status]; !exists {
		return fmt.Errorf("user status \"%s\" is not valid", status.Status)
	}

	// Comment, if present
	if len(status.Comment) > 0 {
		if profaneWord := goaway.ExtractProfanity(status.Comment); profaneWord != "" {
			return fmt.Errorf("comment \"%s\" cannot contain profanity %s", status.Comment, profaneWord)
		}
	}

	return nil
}

// TODO: use Google Cloud Vision API to validate image data for NSFW content.
//
// reject any image that has NSFW flagged.
// Will need to sign up for this api and make sure local config is setup with API keys securely
// and that in the google cloud console we have a hard limit / cap on the images we can process
// to not exceed free tier
// ok but really tho this function might be run too many times.
// for now no...
// func ValidateImage(image database.FileInternal) error {
//
// 	return nil
// }
