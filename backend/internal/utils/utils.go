package utils

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"database/sql"
	"encoding/base64"
	"net/mail"
	"regexp"
)

func IsValidEmail(email string) bool {
	/* Emails must pass 2 checks:
	   1. stdlib's mail parser.
	   2. custom regex ripped from stackoverflow.
	*/
	const emailRegexPattern = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(emailRegexPattern)
	regexRes := re.MatchString(email)

	_, err := mail.ParseAddress(email)
	mailParseRes := err == nil

	return regexRes && mailParseRes
}

// Encrypt bytes
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

// Decrypt bytes
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
	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}

	// Use a fixed IV (initialization vector)
	iv := md5.Sum([]byte(key)) // Using MD5 hash of the key as the IV
	ciphertext := make([]byte, len(plaintext))

	stream := cipher.NewCFBEncrypter(block, iv[:])
	stream.XORKeyStream(ciphertext, []byte(plaintext))

	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptString decrypts ciphertext using the given key.
func DecryptString(ciphertext, key string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher([]byte(key))
	if err != nil {
		return "", err
	}

	// Use the same fixed IV (initialization vector)
	iv := md5.Sum([]byte(key))
	plaintext := make([]byte, len(data))

	stream := cipher.NewCFBDecrypter(block, iv[:])
	stream.XORKeyStream(plaintext, data)

	return string(plaintext), nil
}

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
