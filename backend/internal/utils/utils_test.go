package utils

import (
	"bytes"
	"fmt"
	"testing"
)

func TestIsValidEmail(t *testing.T) {

	type TestStruct struct {
		Email          string
		ExpectedResult bool
	}

	emailTests := []TestStruct{
		// Basic "obvious" invalids
		{Email: "", ExpectedResult: false},
		{Email: "invalid", ExpectedResult: false},
		{Email: "-1", ExpectedResult: false},
		{Email: "veryvalidemailletmein", ExpectedResult: false},
		{Email: "test@example", ExpectedResult: false},
		// Missing '@' or '.' symbol
		{Email: "test@examplecom", ExpectedResult: false},
		{Email: "testexample.com", ExpectedResult: false},
		{Email: "testexamplecom", ExpectedResult: false},
		// Missing domain
		{Email: "test@", ExpectedResult: false},
		// Missing username
		{Email: "@example.com", ExpectedResult: false},
		// Invalid characters
		{Email: "test@exa!mple.com", ExpectedResult: false},
		// Consecutive dots in domain
		{Email: "test@exa..mple.com", ExpectedResult: false},
		// Leading dot in address
		{Email: ".test@example.com", ExpectedResult: false},
		// Trailing dot in address
		{Email: "test.@example.com", ExpectedResult: false},
		// While emails with IP address as domain are technically valid according to RFC 5321
		// we are going to deny them because I don't want to deal with emails that look like that, cmon. Just use a domain name.
		{Email: "test@[123.123.123.123]", ExpectedResult: false},
		// Valid email with subdomain
		{Email: "test@mail.example.com", ExpectedResult: true},
		// Valid email with plus sign
		{Email: "test+label@example.com", ExpectedResult: true},
		// Email with spaces
		{Email: "test @example.com", ExpectedResult: false},
		// Email with special characters in local part
		{Email: "test.email+alex@leetcode.com", ExpectedResult: true},
		// "Normal" emails
		{Email: "ksldj9023jklnbkldf@gmail.com", ExpectedResult: true},
		{Email: "test@gmail.com", ExpectedResult: true},
		{Email: "test123@yahoo.com", ExpectedResult: true},
		{Email: "test123@yahoo.com", ExpectedResult: true},
	}

	for i, test := range emailTests {
		email := test.Email
		expected := test.ExpectedResult
		got := IsValidEmail(email)
		if expected != got {
			t.Errorf("validation failed for email: %s, test #%d", email, i)
		}
	}
}

func TestEncryptBytes(t *testing.T) {
	type test struct {
		plainBytes  []byte
		key         string
		expectError bool
	}

	// test with 24 byte key -- AES 192 bit
	key := "RdHFZi8zTaQA159oWhbZgpKk"
	tests := []test{
		{[]byte("test"), key, false},
		{[]byte{1, 2, 3, 4}, key, false},
		{[]byte{}, key, false}, // empty input should return empty output
		{[]byte{1}, key, false},
		{[]byte(";asjdfkal;jsdfkl;jasdfaj;sdflj190jfs;djfklj;asdkl;fj"), key, false},
	}

	for i, test := range tests {
		cipherBytes, err := EncryptBytes(test.plainBytes, test.key)
		if !test.expectError && err != nil {
			t.Errorf("test #%d - got unexpected error returned", i)
		} else if len(test.plainBytes) > 0 && bytes.Equal(cipherBytes, test.plainBytes) {
			t.Errorf("test #%d - got unexpected cipherBytes equal to plainBytes", i)
		}
	}

	// test with empty key, should reject all input
	key = ""
	tests = []test{
		{[]byte("test"), key, true},
		{[]byte{1, 2, 3, 4}, key, true},
		{[]byte{}, key, true}, // empty input should return empty output
		{[]byte{1}, key, true},
		{[]byte(";asjdfkal;jsdfkl;jasdfaj;sdflj190jfs;djfklj;asdkl;fj"), key, true},
	}

	for i, test := range tests {
		cipherBytes, err := EncryptBytes(test.plainBytes, test.key)
		if !test.expectError && err != nil {
			t.Errorf("test #%d - got unexpected error returned", i)
		} else if len(test.plainBytes) > 0 && bytes.Equal(cipherBytes, test.plainBytes) {
			t.Errorf("test #%d - got unexpected cipherBytes equal to plainBytes", i)
		}
	}
}

func TestDecryptBytes(t *testing.T) {
	type test struct {
		plainBytes     []byte
		encryptedBytes []byte
		key            string
		expectError    bool
	}

	inputs := []string{"", "1", "a", "jklasdjiofkl", "189jdklfj;aj2390j;;;l///", "some_random_valid_input"}

	// Regular operation
	// Encrypt with key, decrypt with key
	// Expect plainBytes to be decrypted bytes
	key := "RdHFZi8zTaQA159oWhbZgpKk"
	var tests []test
	for _, str := range inputs {
		encryptedBytes, err := EncryptBytes([]byte(str), key)
		if err != nil {
			t.Fatal("unexpected err")
		}
		tests = append(tests, test{
			plainBytes:     []byte(str),
			encryptedBytes: encryptedBytes,
			key:            key,
			expectError:    false,
		})
	}
	for i, test := range tests {
		decryptedBytes, err := DecryptBytes(test.encryptedBytes, test.key)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - err is nil but expected error", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - err is not nil but expected nil", i)
			}
		}

		if len(test.plainBytes) > 0 {
			// input is not empty
			// decrypted bytes SHOULD NOT be the same as the encrypted bytes
			if bytes.Equal(decryptedBytes, test.encryptedBytes) {
				t.Errorf("test #%d - got unexpected cipherBytes equal to plainBytes", i)
			}
		} else {
			// input is empty
			// decrypted bytes SHOULD be the same as encrypted bytes
			if !bytes.Equal(test.plainBytes, decryptedBytes) {
				t.Errorf("test #%d - decrypted bytes not equal to original plain bytes input", i)
			}
		}
	}

	// Encrypt with key, decrypt with key2
	// Decrypted output should be different from the actual unencrypted input
	key2 := "mAq92XO8hDYAu0FOwk4CkOc8"
	for i := range len(tests) {
		tests[i].key = key2
	}
	for i, test := range tests {
		decryptedBytes, err := DecryptBytes(test.encryptedBytes, test.key)
		fmt.Print(err)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - err is nil but expected error", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - err is not nil but expected nil", i)
			}
		}

		// We EXPECT decrypted bytes to be different from plain bytes bc we used the wrong key.
		if len(test.plainBytes) > 0 {
			// input is not empty

			// decrypted bytes SHOULD NOT be the same as plain bytes
			if bytes.Equal(decryptedBytes, test.plainBytes) {
				t.Errorf("test #%d - decrypted bytes are equal to the plainbytes but expected different bc using different key to decrypt than encrypt", i)
			}

			// decrypted bytes SHOULD NOT be the same as the encrypted bytes
			if bytes.Equal(decryptedBytes, test.encryptedBytes) {
				t.Errorf("test #%d - got unexpected cipherBytes equal to plainBytes", i)
			}
		} else {
			// input is empty

			// decrypyted bytes SHOULD be the same as plain bytes
			if !bytes.Equal(decryptedBytes, test.plainBytes) {
				t.Errorf("test #%d - decrypted bytes are equal to the plainbytes but expected different bc using different key to decrypt than encrypt", i)
			}

			// decrypted bytes SHOULD be the same as encrypted bytes
			if !bytes.Equal(test.plainBytes, decryptedBytes) {
				t.Errorf("test #%d - decrypted bytes not equal to original plain bytes input", i)
			}
		}
	}

	// Encrypt with key, decrypt with emptyKey
	// Decrypted output should be different from the actual unencrypted input
	emptyKey := ""

	// Clear tests and recreate them using key but saving emptyKey in
	// test struct to be used for decrypt
	tests = nil
	for _, str := range inputs {
		encryptedBytes, err := EncryptBytes([]byte(str), key)
		if err != nil {
			t.Fatal("unexpected err")
		}
		tests = append(tests, test{
			plainBytes:     []byte(str),
			encryptedBytes: encryptedBytes,
			key:            emptyKey,
			expectError:    true,
		})
	}
	for i, test := range tests {
		decryptedBytes, err := DecryptBytes(test.encryptedBytes, test.key)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - err is nil but expected error", i)
			}
			// Ensure that decryptedBytes returned is nil when error is not nil
			if decryptedBytes != nil {
				t.Errorf("test #%d - decryptedBytes is not nil but expected nil", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - err is not nil but expected nil", i)
			}
		}
	}

	// Encrypt with valid key, decrypt with invalid key (not of correct size 16, 24, or 32 bytes)
	badKey := "invalidkey"

	// Clear tests and recreate them using key but saving emptyKey in
	// test struct to be used for decrypt
	tests = nil
	for _, str := range inputs {
		encryptedBytes, err := EncryptBytes([]byte(str), key)
		if err != nil {
			t.Fatal("unexpected err")
		}
		tests = append(tests, test{
			plainBytes:     []byte(str),
			encryptedBytes: encryptedBytes,
			key:            badKey,
			expectError:    true,
		})
	}
	for i, test := range tests {
		decryptedBytes, err := DecryptBytes(test.encryptedBytes, test.key)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - err is nil but expected error", i)
			}
			// Ensure that decryptedBytes returned is nil when error is not nil
			if decryptedBytes != nil {
				t.Errorf("test #%d - decryptedBytes is not nil but expected nil", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - err is not nil but expected nil", i)
			}
		}
	}
}

func TestEncryptString(t *testing.T) {

}

func TestDecryptString(t *testing.T) {

}

func TestCreateSQLNullString(t *testing.T) {

}
