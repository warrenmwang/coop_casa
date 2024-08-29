package interfaces

import "backend/internal/database"

type Server interface {
	DB() database.Service
}
