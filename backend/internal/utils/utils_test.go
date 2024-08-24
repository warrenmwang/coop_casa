package utils

import (
	"bytes"
	"database/sql"
	"fmt"
	"testing"
)

func TestCalculateAge(t *testing.T) {
	// Valid test case, considering that time cannot flow backwards
	// we'll use minimum age tests

	test1 := "2000-01-01"
	var expectedMinAge int16 = 24
	testResult1, err := CalculateAge(test1)
	if err != nil {
		t.Fatal("received error from calculated age when did not expect")
	}
	if testResult1 < expectedMinAge {
		t.Error("calculated age is less than minimum age expected from test 1")
	}

	// Invalid tests
	test2 := ""
	testResult2, err := CalculateAge(test2)
	if err == nil {
		t.Error("did not receive error from calculated age when expected")
	}
	if testResult2 != -1 {
		t.Error("did not receive -1 age for failed time parsing test case")
	}

	test3 := "j001-01-01"
	testResult3, err := CalculateAge(test3)
	if err == nil {
		t.Error("did not receive error from calculated age when expected")
	}
	if testResult3 != -1 {
		t.Error("did not receive -1 age for failed time parsing test case")
	}

	test4 := "2001-k1-01"
	testResult4, err := CalculateAge(test4)
	if err == nil {
		t.Error("did not receive error from calculated age when expected")
	}
	if testResult4 != -1 {
		t.Error("did not receive -1 age for failed time parsing test case")
	}

	test5 := "2001-01-0k"
	testResult5, err := CalculateAge(test5)
	if err == nil {
		t.Error("did not receive error from calculated age when expected")
	}
	if testResult5 != -1 {
		t.Error("did not receive -1 age for failed time parsing test case")
	}
}

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
	type test struct {
		plaintext   string
		encryptKey  string
		expectError bool
	}

	// Define some keys for the tests
	validKey1 := "RdHFZi8zTaQA159oWhbZgpKk"
	validKey2 := "mAq92XO8hDYAu0FOwk4CkOc8"
	invalidKey1 := ""
	invalidKey2 := "imtooshort"

	// Define all tests
	tests := []test{
		{"", validKey1, false},
		{"helloworld", validKey1, false},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey1, false},
		{"", validKey2, false},
		{"helloworld", validKey2, false},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey2, false},
		{"", invalidKey1, true},
		{"helloworld", invalidKey1, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", invalidKey1, true},
		{"", invalidKey2, true},
		{"helloworld", invalidKey2, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", invalidKey2, true},
	}

	for i, test := range tests {
		encryptedStr, err := EncryptString(test.plaintext, test.encryptKey)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - expected error not nil but got error is nil", i)
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - expected error nil but got error is not nil", i)
			}
			if len(test.plaintext) > 0 && encryptedStr == test.plaintext {
				t.Errorf("test #%d - expected encryptedStr to be different from input plaintext, but they are same", i)
			}
		}
	}
}

func TestDecryptString(t *testing.T) {
	type test struct {
		plaintext   string
		encryptKey  string
		decryptKey  string
		expectError bool
		isDiffKeys  bool
	}

	// Define some keys for the tests
	// (Once again using 24 byte keys for AES-192)
	validKey1 := "RdHFZi8zTaQA159oWhbZgpKk"
	validKey2 := "mAq92XO8hDYAu0FOwk4CkOc8"
	invalidKey1 := ""
	invalidKey2 := "imtooshort"

	// Define all tests, in which all encryption works
	tests := []test{
		// Expected, regular operation with correct inputs
		{"", validKey1, validKey1, false, false},
		{"helloworld", validKey1, validKey1, false, false},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey1, validKey1, false, false},
		{"", validKey2, validKey2, false, false},
		{"helloworld", validKey2, validKey2, false, false},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey2, validKey2, false, false},
		// Use different encryption and decryption keys
		{"", validKey1, validKey2, false, true},
		{"helloworld", validKey1, validKey2, false, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey1, validKey2, false, true},
		{"", validKey2, validKey1, false, true},
		{"helloworld", validKey2, validKey1, false, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey2, validKey1, false, true},
		// Use invalid decryption keys
		{"", validKey1, invalidKey1, true, true},
		{"helloworld", validKey1, invalidKey1, true, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey1, invalidKey1, true, true},
		{"", validKey2, invalidKey2, true, true},
		{"helloworld", validKey2, invalidKey2, true, true},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", validKey2, invalidKey2, true, true},
	}

	for i, test := range tests {
		// Setup for decryption
		encryptedStr, err := EncryptString(test.plaintext, test.encryptKey)
		if err != nil {
			t.Errorf("unexpected err -- fix this test")
		}

		decryptedStr, err := DecryptString(encryptedStr, test.decryptKey)
		if test.expectError {
			if err == nil {
				t.Errorf("test #%d - expected error but didn't get one", i)
				continue
			}
		} else {
			if err != nil {
				t.Errorf("test #%d - didn't expect error but got one", i)
				continue
			}
		}

		if test.isDiffKeys {
			if len(test.plaintext) > 0 && decryptedStr == test.plaintext {
				t.Errorf("test #%d - expected decryptedStr to be different than input plaintext since using different decryption key, but got correct output", i)
			}
		} else {
			if decryptedStr != test.plaintext {
				t.Errorf("test #%d - expected decryptedStr to be the same as input plaintext since using same key for encrypt and decrypt, but got different outputs", i)
			}
		}
	}
}

func TestCreateSQLNullString(t *testing.T) {
	type test struct {
		input          string
		expectedOutput sql.NullString
	}

	tests := []test{
		{"", sql.NullString{String: "", Valid: false}},
		{"helloworld", sql.NullString{String: "helloworld", Valid: true}},
		{"!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", sql.NullString{String: "!@#$%^*()&+_JKLKLVJ~|}{_{LDJKFKL}}", Valid: true}},
	}

	for i, test := range tests {
		if CreateSQLNullString(test.input) != test.expectedOutput {
			t.Errorf("test #%d - incorrect null string output", i)
		}
	}
}
