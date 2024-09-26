package validation

import (
	"backend/internal/database"
	"fmt"
	"math/rand/v2"
	"strings"
	"testing"
	"time"

	"github.com/google/uuid"
)

func TestValidateCommunityDetails(t *testing.T) {
	type test struct {
		input       database.CommunityDetails
		expectError bool
	}

	communityID1 := uuid.NewString()
	communityID2 := uuid.NewString()
	invalidCommunityID1 := ""
	invalidCommunityID2 := "yourmom"
	adminID1 := fmt.Sprintf("%d", rand.IntN(1000000))
	adminID2 := fmt.Sprintf("%d", rand.IntN(1000000))
	invalidAdminID1 := ""
	invalidAdminID2 := "seeyouspacecowboy"
	invalidAdminID3 := "109kdljf023jklj"

	tests := []test{
		// Valid tests
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: adminID1,
				Name:        "Hello Kitty Club",
				Description: "", // empty description ok
			},
			expectError: false,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: adminID1,
				Name:        "thomasaquinasfanclub",
				Description: "If you can't reason or have faith, we don't want you here.",
			},
			expectError: false,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID2,
				AdminUserID: adminID1,
				Name:        "thomasaquinasfanclub",
				Description: "If you can't reason or have faith, we don't want you here.",
			},
			expectError: false,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID2,
				AdminUserID: adminID2,
				Name:        "thomasaquinasfanclub",
				Description: "If you can't reason or have faith, we don't want you here.",
			},
			expectError: false,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: adminID2,
				Name:        "thomasaquinasfanclub",
				Description: "If you can't reason or have faith, we don't want you here.",
			},
			expectError: false,
		},
		// Invalid inputs
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: adminID1,
				Name:        "", // name cannot be empty
				Description: "",
			},
			expectError: true,
		},
		{
			input: database.CommunityDetails{
				CommunityID: invalidCommunityID1,
				AdminUserID: adminID1,
				Name:        "name",
				Description: "",
			},
			expectError: true,
		},
		{
			input: database.CommunityDetails{
				CommunityID: invalidCommunityID2,
				AdminUserID: adminID1,
				Name:        "name",
				Description: "",
			},
			expectError: true,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: invalidAdminID1,
				Name:        "name",
				Description: "",
			},
			expectError: true,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: invalidAdminID2,
				Name:        "name",
				Description: "",
			},
			expectError: true,
		},
		{
			input: database.CommunityDetails{
				CommunityID: communityID1,
				AdminUserID: invalidAdminID3,
				Name:        "name",
				Description: "",
			},
			expectError: true,
		},
	}

	for i, test := range tests {
		err := ValidateCommunityDetails(test.input)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - expected error but didn't get one", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - didn't expect error but got one", i)
			}
		}
	}
}

func TestValidatePropertyDetails(t *testing.T) {
	type test struct {
		input       database.PropertyDetails
		expectError bool
	}

	uuid1 := uuid.NewString()
	listerUserID1 := "109237874690123"

	tests := []test{
		{
			// valid property
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "asdf",
			},
			false,
		},
		{
			// missing property id
			database.PropertyDetails{
				PropertyID:        "",
				ListerUserID:      "109237874690123",
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing lister user id
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      "",
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing name
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing address 1
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing city
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "",
				State:             "state",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing state
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "",
				Zipcode:           "12345",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing zipcode
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "",
				Country:           "usa",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// missing country
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid square feet (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       -1,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid square feet (too much)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       1000000000,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid num bedrooms (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      -1,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid num toilets (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       -1,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid num showers baths (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: -1,
				Cost_dollars:      123,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid cost dollars (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      -1,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid cost dollars (too much)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      1000000000000,
				Cost_cents:        12,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid cost cents (negative)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        -1,
				Misc_note:         "as",
			},
			true,
		},
		{
			// invalid cost cents (too much)
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "fuck",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "asshole",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "u a bitch ass hoe",
				Address_2:         "",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "i fucked your mom",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "bitch",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "F   u   C  k",
				Zipcode:           "zipcode",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "$hiT",
				Country:           "country",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
		{
			// bad words
			database.PropertyDetails{
				PropertyID:        uuid1,
				ListerUserID:      listerUserID1,
				Name:              "name",
				Description:       "",
				Address_1:         "123 home street",
				Address_2:         "apt pizzahut",
				City:              "city",
				State:             "state",
				Zipcode:           "zipcode",
				Country:           "cunt",
				Square_feet:       123,
				Num_bedrooms:      123,
				Num_toilets:       123,
				Num_showers_baths: 123,
				Cost_dollars:      123,
				Cost_cents:        100,
				Misc_note:         "as",
			},
			true,
		},
	}

	for i, test := range tests {
		err := ValidatePropertyDetails(test.input)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - expected error but got none", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - didn't expect error but got one: %s", i, err)
			}
		}
	}
}

func TestValidateUserDetails(t *testing.T) {
	type test struct {
		input       database.UserDetails
		expectError bool
	}

	userID1 := "109237874690123"
	tests := []test{
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "0280-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			false,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "frosty",
				LastName:  "thesnowman",
				BirthDate: "1999-01-01",
				Gender:    "Woman",
				Location:  "Siberia",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			false,
		},
		{
			database.UserDetails{
				UserID:    "", // empty user id
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "0280-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "", // empty email
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "0280-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "", // empty first name
				LastName:  "claus",
				BirthDate: "0280-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "", // empty last name
				BirthDate: "0280-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "", // empty birth date
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: strings.Split(time.Now().String(), " ")[0], // invalid birth date (too young)
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "1999-12-25",
				Gender:    "", // empty gender
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "", // empty location
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{}, // empty interests
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "santa",
				LastName:  "claus",
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"making love to santa claus"}, // invalid interest
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "fuck you", // profanity
				LastName:  "lastname",
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "firstname",
				LastName:  "bitch ass hoe", // profanity
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
		{
			database.UserDetails{
				UserID:    userID1,
				Email:     "example@example.com",
				FirstName: "fuck you",      // profanity
				LastName:  "bitch ass hoe", // profanity
				BirthDate: "1999-12-25",
				Gender:    "Man",
				Location:  "North Pole, Arctic",
				Interests: []string{"Reading", "Traveling", "History"},
			},
			true,
		},
	}

	for i, test := range tests {
		err := ValidateUserDetails(test.input)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - expected error but got none", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - didn't expect error but got one: %s", i, err)
			}
		}
	}
}
