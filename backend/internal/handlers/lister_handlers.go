package handlers

import (
	"backend/internal/auth"
	"backend/internal/config"
	"backend/internal/database"
	"backend/internal/interfaces"
	"backend/internal/utils"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

type ListerHandler struct {
	server interfaces.Server
}

func NewListerHandlers(s interfaces.Server) *ListerHandler {
	return &ListerHandler{server: s}
}

// GET .../lister
// AUTHED
func (h *ListerHandler) GetListersFromListersHandler(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user's ID
	authedUserID, ok := r.Context().Value(auth.UserIDKey).(string)
	if !ok {
		utils.RespondWithError(w, http.StatusMethodNotAllowed, errors.New("user id blank"))
		return
	}

	// Check their role and ensure lister or higher
	role, err := h.server.DB().GetUserRole(authedUserID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if role == config.USER_ROLE_REGULAR {
		utils.RespondWithError(w, http.StatusUnauthorized, err)
		return
	}

	// Get query params for retrieving filtered or non filtered set of lister information
	query := r.URL.Query()
	limitStr := query.Get("limit")
	pageStr := query.Get("page")
	name := query.Get("nameFilter")

	// Parse offset and limit
	var offset int
	offset, err = strconv.Atoi(pageStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, fmt.Errorf("unable to parse page: %s", pageStr))
		return
	}

	var limit int
	limit, err = strconv.Atoi(limitStr)
	if err != nil {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, fmt.Errorf("unable to parse limit: %s", limitStr))
		return
	}

	// Calculate the correct offset
	offset = offset * limit

	// Query with filters and params
	listersDetails, err := h.server.DB().GetManyListersDetails(int32(limit), int32(offset), name)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Don't return nulls, prefer empty array!
	if listersDetails == nil {
		listersDetails = []database.ListerDetails{}
	}

	// Respond with listers details
	utils.RespondWithJSON(w, http.StatusOK, listersDetails)
}

// GET .../lister/{id}
// NO AUTH
func (h *ListerHandler) GetListerInfoHandler(w http.ResponseWriter, r *http.Request) {
	listerID := chi.URLParam(r, "id")
	if listerID == "" {
		utils.RespondWithError(w, http.StatusUnprocessableEntity, errors.New("listerID empty"))
		return
	}

	// Check the role of the userid
	role, err := h.server.DB().GetUserRole(listerID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if role != config.USER_ROLE_LISTER && role != config.USER_ROLE_ADMIN {
		utils.RespondWithError(w, http.StatusInternalServerError, errors.New("user is not a lister"))
		return
	}

	// Check the account status of the lister, if not normal/public
	// then return an anonymized thing
	status, err := h.server.DB().GetUserStatus(listerID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}
	if status.UserStatus.Status != config.USER_STATUS_NORMAL {
		utils.RespondWithJSON(w, http.StatusOK, database.PublicBasicListerDetails{
			UserID:    "0000000000000",
			Email:     "privated@account.com",
			FirstName: "User Profile",
			LastName:  "Privated",
		})
		return
	}

	// userID is a lister, return the email and name for basic contact information
	lister, err := h.server.DB().GetUserDetails(listerID)
	if err != nil {
		utils.RespondWithError(w, http.StatusInternalServerError, err)
		return
	}

	// Respond with public, basic lister information
	utils.RespondWithJSON(w, http.StatusOK, database.PublicBasicListerDetails{
		UserID:    lister.UserID,
		Email:     lister.Email,
		FirstName: lister.FirstName,
		LastName:  lister.LastName,
	})
}
