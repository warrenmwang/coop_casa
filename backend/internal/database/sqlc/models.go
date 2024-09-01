// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0

package sqlc

import (
	"database/sql"
	"time"
)

type CommunitiesImage struct {
	ID          int32
	CommunityID string
	FileName    string
	MimeType    string
	Size        int64
	Data        []byte
	UpdatedAt   time.Time
}

type CommunitiesProperty struct {
	ID          int32
	CommunityID string
	PropertyID  string
}

type CommunitiesUser struct {
	ID          int32
	CommunityID string
	UserID      string
}

type Community struct {
	ID          int32
	CommunityID string
	AdminUserID string
	Name        string
	Description sql.NullString
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

type PropertiesImage struct {
	ID         int32
	PropertyID string
	OrderNum   int16
	FileName   string
	MimeType   string
	Size       int64
	Data       []byte
	CreatedAt  time.Time
}

type Property struct {
	ID              int32
	PropertyID      string
	ListerUserID    string
	Name            string
	Description     sql.NullString
	Address1        string
	Address2        sql.NullString
	City            string
	State           string
	Zipcode         string
	Country         string
	SquareFeet      int32
	NumBedrooms     int16
	NumToilets      int16
	NumShowersBaths int16
	CostDollars     int64
	CostCents       int16
	MiscNote        sql.NullString
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

type Role struct {
	ID        int32
	UserID    string
	Role      string
	UpdatedAt time.Time
}

type User struct {
	ID        int32
	UserID    string
	Email     string
	FirstName sql.NullString
	LastName  sql.NullString
	BirthDate sql.NullString
	Gender    sql.NullString
	Location  sql.NullString
	Interests []string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type UserImage struct {
	ID        int32
	UserID    string
	FileName  string
	MimeType  string
	Size      int64
	Data      []byte
	CreatedAt time.Time
}

type UsersAvatar struct {
	ID        int32
	UserID    string
	FileName  sql.NullString
	MimeType  sql.NullString
	Size      sql.NullInt64
	Data      []byte
	UpdatedAt time.Time
}

type UsersSavedCommunity struct {
	ID          int32
	UserID      string
	CommunityID string
	CreatedAt   time.Time
}

type UsersSavedProperty struct {
	ID         int32
	UserID     string
	PropertyID string
	CreatedAt  time.Time
}

type UsersSavedUser struct {
	ID          int32
	UserID      string
	SavedUserID string
	CreatedAt   time.Time
}
