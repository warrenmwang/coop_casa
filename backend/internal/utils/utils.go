package utils

import (
	"time"
)

func ParseStringToNullTime(timeStr string) (time.Time, error) {
	// Define the layout according to the format of your time string
	layout := "2006-01-02"

	// Parse the string into a time.Time object
	parsedTime, err := time.Parse(layout, timeStr)
	if err != nil {
		return time.Time{}, err
	}

	return parsedTime, nil
}
