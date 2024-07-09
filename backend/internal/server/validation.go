package server

import (
	"backend/internal/database"
	"backend/internal/utils"
	"errors"
	"time"
)

func IsPropertyUsingDuplicateAddress(propertyDetails database.PropertyDetails, s *Server) error {
	// Check property is not duplicate address
	return s.db.CheckDuplicateProperty(propertyDetails)
}

// Validate property details
func ValidatePropertyDetails(propertyDetails database.PropertyDetails) error {
	// Ensure property id is a valid uuidv4
	if !utils.IsValidUUID(propertyDetails.PropertyID) {
		return errors.New("invalid form state: property id is not a valid uuid")
	}

	// Ensure lister id is present
	if len(propertyDetails.ListerUserID) == 0 {
		return errors.New("invalid form state: property's lister id is empty")
	}

	// Ensure important fields are not empty or out of expected range
	if len(propertyDetails.City) == 0 {
		return errors.New("invalid form state: city is invalid")
	}

	if len(propertyDetails.State) == 0 {
		return errors.New("invalid form state: State is invalid")
	}

	if len(propertyDetails.Zipcode) == 0 {
		return errors.New("invalid form state: Zipcode is invalid")
	}

	if len(propertyDetails.Country) == 0 {
		return errors.New("invalid form state: Country is invalid")
	}

	if v := propertyDetails.Square_feet; v <= 0 || v > 999999999 {
		return errors.New("invalid form state: square feet invalid")
	}

	if v := propertyDetails.Num_bedrooms; v < 0 || v > 32767 {
		return errors.New("invalid form state: number of bedrooms invalid")
	}

	if v := propertyDetails.Num_toilets; v < 0 || v > 32767 {
		return errors.New("invalid form state: number of toilets invalid")
	}

	if v := propertyDetails.Num_showers_baths; v < 0 || v > 32767 {
		return errors.New("invalid form state: number of showers/baths invalid")
	}

	if v := propertyDetails.Cost_dollars; v <= 0 || v > 999999999999 {
		return errors.New("invalid form state: cost in dollars invalid")
	}

	if v := propertyDetails.Cost_cents; v < 0 || v > 99 {
		return errors.New("invalid form state: cost in cents invalid")
	}

	return nil
}

// Validate the user details field values
// Should ensure no SQL injection or whatnot
// Returns an error
func ValidateUserDetails(userDetails database.UserDetails) error {

	// Ensure name fields are not empty
	if len(userDetails.FirstName) == 0 {
		return errors.New("invalid form state: first name is empty")
	}
	if len(userDetails.LastName) == 0 {
		return errors.New("invalid form state: last name is empty")
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
		return errors.New("invalid form state: gender is empty")
	}

	if len(userDetails.Location) == 0 {
		return errors.New("invalid form state: location is empty")
	}

	if len(userDetails.Interests) == 0 {
		return errors.New("invalid form state: interests is empty")
	}

	return nil
}
