// Package interfaces is used to define any global interfaces used internally.
package interfaces

import "backend/internal/database"

// Server interface is used to provide the database Service interface to the
// HTTP handlers. 
type Server interface {
	DB() database.Service
}
