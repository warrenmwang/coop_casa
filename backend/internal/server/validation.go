package server

import (
	"backend/internal/database"
	"errors"
	"time"
)

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
