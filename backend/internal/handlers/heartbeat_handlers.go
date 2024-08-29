package handlers

import (
	"backend/internal/interfaces"
	"encoding/json"
	"log"
	"net/http"
)

type HeartbeatHandler struct {
	server interfaces.Server
}

func NewHeartBeatHandlers(s interfaces.Server) *HeartbeatHandler {
	return &HeartbeatHandler{server: s}
}

// GET /health
func (h *HeartbeatHandler) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	jsonResp, err := json.Marshal(resp)
	if err != nil {
		log.Fatalf("error handling JSON marshal. Err: %v", err)
	}

	_, _ = w.Write(jsonResp)
}

// GET /dbhealth
func (h *HeartbeatHandler) DatabaseHealthHandler(w http.ResponseWriter, r *http.Request) {
	jsonResp, _ := json.Marshal(h.server.DB().Health())
	_, _ = w.Write(jsonResp)
}
