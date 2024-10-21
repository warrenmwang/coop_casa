// Package utils contains utility functions that are commonly across internal packages.
package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// RespondWithJSON responds to an HTTP request with a JSON payload.
func RespondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	response, err := json.Marshal(payload)
	if err != nil {
		log.Fatal(err)
	}
	w.Write(response)
}

// RespondWithError responds to an HTTP request with an error.
func RespondWithError(w http.ResponseWriter, code int, err error) {
	http.Error(w, err.Error(), code)
}

// CalculateAge returns the age of a person in years from a birthdate string.
func CalculateAge(birthdate string) (int16, error) {
	// Parse the birthdate string
	layout := "2006-01-02"
	birthTime, err := time.Parse(layout, birthdate)
	if err != nil {
		return -1, err
	}

	// Get the current time
	currentTime := time.Now()

	// Calculate the age
	age := currentTime.Year() - birthTime.Year()

	// Adjust if the birthdate hasn't occurred yet this year
	if currentTime.YearDay() < birthTime.YearDay() {
		age--
	}

	return int16(age), nil
}

// EncryptBytes encrypts the byte slice with the given key.
func EncryptBytes(plainBytes []byte, key string) ([]byte, error) {
	// Prepare operation with secret key
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return nil, err
	}

	// Use a fixed IV (initialization vector)
	iv := md5.Sum([]byte(key)) // Using MD5 hash of the key as the IV
	cipherBytes := make([]byte, len(plainBytes))

	// Encrypt
	stream := cipher.NewCFBEncrypter(block, iv[:])
	stream.XORKeyStream(cipherBytes, plainBytes)

	return cipherBytes, nil
}

// DecryptBytes decryptes the byte slice with the given key.
func DecryptBytes(cipherbytes []byte, key string) ([]byte, error) {
	// Prepare operation with secret key
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return nil, err
	}

	// Use the same fixed IV (initialization vector)
	iv := md5.Sum([]byte(key))
	plainBytes := make([]byte, len(cipherbytes))

	// Decrypt
	stream := cipher.NewCFBDecrypter(block, iv[:])
	stream.XORKeyStream(plainBytes, cipherbytes)

	return plainBytes, nil
}

// EncryptString encrypts plaintext using the given key.
func EncryptString(plaintext, key string) (string, error) {
	// View string as []byte and encrypt.
	cipherBytes, err := EncryptBytes([]byte(plaintext), key)
	if err != nil {
		return "", err
	}

	// Convert encrypted bytes into a string via base64 encoding.
	return base64.StdEncoding.EncodeToString(cipherBytes), nil
}

// DecryptString decrypts ciphertext using the given key.
func DecryptString(ciphertext, key string) (string, error) {
	// Convert ciphertext, expected to be base64 encoded string of cipher bytes,
	// into the byte array of cipher bytes
	cipherBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	// Decrypt cipher bytes
	plainBytes, err := DecryptBytes(cipherBytes, key)
	if err != nil {
		return "", err
	}

	// Convert plain bytes into string and return
	return string(plainBytes), nil
}

// CreateSQLNullString is a utility that creates a SQL Null string and sets
// it to invalid if string is empty.
func CreateSQLNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{
			String: "",
			Valid:  false,
		}
	}
	return sql.NullString{
		String: s,
		Valid:  true,
	}
}
