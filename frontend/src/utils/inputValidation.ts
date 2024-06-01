export const MAX_TEXT_INPUT_LENGTH = 100
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export const validateUserTextInput = (id:string, value:string) : boolean => {
  // Validates the user input
  // Return true for valid, else false

  // Check if the value length exceeds our MAX_TEXT_INPUT_LENGTH characters
  if (value.length > MAX_TEXT_INPUT_LENGTH) {
    return false // Do not update the state if the length exceeds 100 characters
  }
  
  // If birthDate field, ensure it is valid
  // If the field is the birthDate, validate the date format
  if (id === "birthDate") {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/ // YYYY-MM-DD format
    if (!datePattern.test(value)) {
      return false // Do not update the state if the date format is invalid
    }
  }

  

  return true
}

export const validateUserAvatarInput = (file : File) : boolean => {
  const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

  // Check file size
  if (file.size > MAX_AVATAR_FILE_SIZE) {
    alert('File size should not exceed 5 MB.');
    return false
  }

  // Check file type is valid image 
  if (!validImageTypes.includes(file.type)) {
    return false
  }

  return true
}