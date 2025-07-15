const generateCode = (codeLength = 6) => {
  const number = String(Math.floor(Math.random() * 10 ** codeLength));

  const length = number.length;

  let code = "";

  for (let i = 0; i < codeLength - length; i++) {
    code += "0";
  }

  return code + number;
};

module.exports = generateCode;
