package database

import "time"

type FileInternal struct {
	Filename string
	Mimetype string
	Size     int64
	Data     []byte
}

type FileExternal struct {
	Filename string `json:"fileName"`
	Mimetype string `json:"mimeType"`
	Size     int64  `json:"size"`
	Data     string `json:"data"`
}

type OrderedFileInternal struct {
	OrderNum int16        `json:"orderNum"`
	File     FileInternal `json:"file"`
}

type OrderedFileExternal struct {
	OrderNum int16        `json:"orderNum"`
	File     FileExternal `json:"file"`
}

type UserDetails struct {
	UserID    string   `json:"userId"`
	Email     string   `json:"email"`
	FirstName string   `json:"firstName"`
	LastName  string   `json:"lastName"`
	BirthDate string   `json:"birthDate"`
	Gender    string   `json:"gender"`
	Location  string   `json:"location"`
	Interests []string `json:"interests"`
}

type UsersSavedProperty struct {
	UserID     string    `json:"userID"`
	PropertyID string    `json:"propertyID"`
	CreatedAt  time.Time `json:"createdAt"`
}

type PropertyDetails struct {
	PropertyID        string `json:"propertyId"`
	ListerUserID      string `json:"listerUserId"`
	Name              string `json:"name"`
	Description       string `json:"description"`
	Address_1         string `json:"address1"`
	Address_2         string `json:"address2"`
	City              string `json:"city"`
	State             string `json:"state"`
	Zipcode           string `json:"zipcode"`
	Country           string `json:"country"`
	Square_feet       int32  `json:"squareFeet"`
	Num_bedrooms      int16  `json:"numBedrooms"`
	Num_toilets       int16  `json:"numToilets"`
	Num_showers_baths int16  `json:"numShowersBaths"`
	Cost_dollars      int64  `json:"costDollars"`
	Cost_cents        int16  `json:"costCents"`
	Misc_note         string `json:"miscNote"`
}

type PropertyFull struct {
	PropertyDetails PropertyDetails       `json:"details"`
	PropertyImages  []OrderedFileExternal `json:"images"`
}

type CommunityDetails struct {
	CommunityID string `json:"communityId"`
	AdminUserID string `json:"adminUserId"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type CommunityFull struct {
	CommunityDetails    CommunityDetails `json:"details"`
	CommunityImages     []FileExternal   `json:"images"`
	CommunityUsers      []string         `json:"users"`      // user ids
	CommunityProperties []string         `json:"properties"` // property ids
}

type PublicUserProfileDetails struct {
	UserID     string   `json:"userId"`
	FirstName  string   `json:"firstName"`
	LastName   string   `json:"lastName"`
	AgeInYears int16    `json:"ageInYears"`
	Gender     string   `json:"gender"`
	Location   string   `json:"location"`
	Interests  []string `json:"interests"`
}

type PublicUserProfile struct {
	Details PublicUserProfileDetails `json:"details"`
	Images  []FileExternal           `json:"images"`
}
