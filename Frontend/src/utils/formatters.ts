export const stripNonDigits = (value: string): string => {
  return value ? value.replace(/\D/g, '') : '';
};

export const sanitizeText = (value: string): string => {
  if (!value) return '';
  return value.trim().replace(/\s+/g, ' ').toUpperCase();
};

export const maskCPF = (value: string): string => {
  const digits = stripNonDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
};

export const maskCEP = (value: string): string => {
  const digits = stripNonDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
};

export const maskPhone = (value: string): string => {
  const digits = stripNonDigits(value).slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

export const isValidCPF = (cpf: string): boolean => {
  const cleanCPF = stripNonDigits(cpf);
  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleanCPF.charAt(i), 10) * (10 - i);
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cleanCPF.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleanCPF.charAt(i), 10) * (11 - i);
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  return rev === parseInt(cleanCPF.charAt(10), 10);
};

export const fetchAddressByCEP = async (cep: string) => {
  const clean = stripNonDigits(cep);
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return {
      logradouro: sanitizeText(data.logradouro),
      bairro: sanitizeText(data.bairro),
      municipio: sanitizeText(data.localidade),
      uf: data.uf.toUpperCase(),
    };
  } catch {
    return null;
  }
};