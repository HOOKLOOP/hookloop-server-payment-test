enum ApiResults {
  SUCCESS_CREATE = "Create Successfully！",
  SUCCESS_UPDATE = "Update Successfully！",
  SUCCESS_DELETE = "Delete Successfully！",
  SUCCESS_GET_DATA = "Get Data Successfully！",
  SUCCESS_DOWNLOAD = "Download Successfully！",
  SUCCESS_SEND_EMAIL = "The letter has been delivered！Please check your email!",
  FAIL_CREATE = "Failed to create！",
  FAIL_READ = "Failed to get information from DB",
  FAIL_UPDATE = "Failed to update！",
  FAIL_DELETE = "Failed to delete !",
  FAIL_TO_GET_DATA = "Failed to Get Data!",
  FAIL_DOWNLOAD = "Failed to Download !",
  FAIL_TO_SEND_EMAIL = "Failed to send your email !",
  FILE_HANDLER_FAIL = "No file or file size over than 1MB.",
  FILE_NOT_FOUND = "File not found.",
  FAIL_UPLOAD = "Failed to upload file.",
  FAIL_UPLOAD_FILE_SIZE = "File size over than 1MB.",
  FAIL_UPLOAD_IMAGE_SIZE = "Image size over than 500KB.",
  FAIL_UPLOAD_FILE_TYPE = "File type is not allowed.",
  NOT_FOUND = "Failed to find this page, please check your URL！",
  UNEXPECTED_ERROR = "Unexpected error occurred, please contact the administrator！",
  SUCCESS_LOG_IN = "Log In Successfully！",
  SUCCESS_LOG_OUT = "Log Out Successfully！",
  FAIL_LOG_IN = "Failed to log in !",
  MIS_MATCH_PASSWORD = "Invalid password! Please try again.",
  UNAUTHORIZED_IDENTITY = "Authentication failed. Please check if your account and password are correct.",
  VERIFIED_TOKEN = "Token has been verified! ",
  TOKEN_IS_NULL = "Token is null. Can't be identitied. Please log in!",
  TOKEN_IS_EXPIRED = "Token is expired! ",
  EMAIL_BEEN_USED = "The email is already existing!",
  EMAIL_BEEN_SENT_ALREADY = "The reset password email has been sent already!",
  EMAIL_IS_REQUIRE = "The email is required!",
  EMAIL_NOT_BEEN_USED = "This email has not been used yet.",
  VALIDATOR_TYPE_ERROR = "Validation fail!",
  SEND_RESET_PASSWORD_EMAIL = "Password Reset Email Sent!",
  USER_IS_ARCHIVED = "The account is suspended!",
  PLAN_FOR_PAYMENT_IS_REQUIRED = "The Plan is required!",
  FAIL_TO_PAY = "Pay Result: Fail! ",
  SUCCESS_TO_PAY = "Pay Result: Success! ",
}

export default ApiResults;
