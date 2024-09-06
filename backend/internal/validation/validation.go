package validation

import (
	"backend/internal/database"
	"backend/internal/utils"
	"errors"
	"time"

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

	return nil
}

func ValidateCommnityDetails(details database.CommunityDetails) error {
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

	if len(details.Name) == 0 {
		return errors.New("name cannot be empty string")
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

	// Ensure important fields are not empty or out of expected range
	if len(propertyDetails.Name) == 0 {
		return errors.New("name is invalid")
	}

	if len(propertyDetails.City) == 0 {
		return errors.New("city is invalid")
	}

	if len(propertyDetails.State) == 0 {
		return errors.New("state is invalid")
	}

	if len(propertyDetails.Zipcode) == 0 {
		return errors.New("zipcode is invalid")
	}

	if len(propertyDetails.Country) == 0 {
		return errors.New("country is invalid")
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

	// Ensure name fields are not empty
	if len(userDetails.FirstName) == 0 {
		return errors.New("first name is empty")
	}
	if len(userDetails.LastName) == 0 {
		return errors.New("last name is empty")
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

	// Ensure rest of fields are not empty
	if len(userDetails.Gender) == 0 {
		return errors.New("gender is empty")
	}

	if len(userDetails.Location) == 0 {
		return errors.New("location is empty")
	}

	// Validate that interests string is formatted correctly
	// (comma separated of currently existing strings)
	if len(userDetails.Interests) == 0 {
		return errors.New("interests is empty")
	}

	return nil
}
