export class CustomValidation {
  email_pattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}$/;
  only_char_pattern = /^[a-zA-z]+$/;
  name_pattern = /^[a-zA-z ]+$/;
  number_pattern = "^[1-9][0-9]*$"; //^[^0-9] ^[0-9]*$
  number_pattern_with_zero = "^[0-9][0-9]*$"; //^[^0-9] ^[0-9]*$
  sapce_pattern = /^\S*$/;
  // url_pattern =
  //   "^(https?://)?(www\\.)?([-a-z0-9]{1,63}\\.)*?[a-z0-9][-a-z0-9]{0,61}[a-z0-9]\\.[a-z]{2,6}(/[-\\w@\\+\\.~#\\?&/=%]*)?$";
  url_pattern = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
  // white_space_first_char = /^[^\s]+(\s+[^\s]+)*$/;
  white_space_first_char = "[a-zA-Z0-9][\\sa-zA-Z0-9]{0,50}";
  float_value = "[-+]?[0-9]*.?[0-9]*.";
  price = "(^[1-9.][0-9]$)|(.([^0]d[123456789\\.]))|([1-9].*[0-9])";
  ODValue = "^[0-9.-]*$";
  recipe_price = "(^[1-9.][0-9]$)|(.([^0]d[123456789\\.]))|([1-9].*[0-9])"; // /^[1-9][0-9]*$/  [0]*[1-9][0-9]*  ^-?[0-9]*.?[0-9]+$ /^((?!(0))[0-9]{9})$/
}
