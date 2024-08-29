package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

// --------------- Public Users API ---------------

// GET /api/users
// NO AUTH
//
// Return a list of userIds for the given query, only returning userIDs whose accounts have been setup.
// Expects query parameters to filter for / get pages of userIds
func (s *Server) apiGetUsersHandler(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	offset := query.Get("page")
	if offset == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("empty page query param"))
		return
	}
	limit := query.Get("limit")
	if limit == "" {
		respondWithError(w, http.StatusBadRequest, errors.New("empty limit query param"))
		return
	}

	tmp, err := strconv.ParseInt(offset, 10, 32)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}
	offsetInt := int32(tmp)

	tmp, err = strconv.ParseInt(limit, 10, 32)
	if err != nil {
		respondWithError(w, 500, err)
		return
	}
	limitInt := int32(tmp)

	// Look for extra filters, if they exist
	firstNameFilter := query.Get("filterFirstName")
	lastNameFilter := query.Get("filterLastName")
	var userIDs []string
	if firstNameFilter != "" || lastNameFilter != "" {
		userIDs, err = s.db.GetNextPagePublicUserIDsFilterByName(limitInt, offsetInt, firstNameFilter, lastNameFilter)
	} else {
		userIDs, err = s.db.GetNextPagePublicUserIDs(limitInt, offsetInt)
	}
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithJSON(w, http.StatusOK, struct {
		UserIDs []string `json:"userIDs"`
	}{
		UserIDs: userIDs,
	})
}

// GET /api/users/{id}
// NO AUTH
func (s *Server) apiGetUserHandler(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	userPublicProfile, err := s.db.GetPublicUserProfile(userID)
	if err != nil {
		respondWithError(w, http.StatusInternalServerError, err)
		return
	}

	respondWithJSON(w, http.StatusOK, userPublicProfile)
}
