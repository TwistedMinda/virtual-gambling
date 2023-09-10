import fs from 'fs';
import path from 'path';

export const extractABI = (name: string, destiation?: string) => {
  const dir = path.resolve(
    __dirname,
    `../artifacts/contracts/${name}.sol/${name}.json`
  );
  console.log('dir')
  const file = fs.readFileSync(dir, 'utf8');
  const json = JSON.parse(file);
  const abi = JSON.stringify(json.abi);
  const content = `
export const CONTRACT_INTERFACE = (
	${abi}
)	as const
	`;
  if (destiation) {
    fs.writeFileSync(destiation, content);
    console.log('✅ Extracted ABI to ' + destiation);
  } else {
    console.log('✅ Extracted ABI');
    console.log(content);
  }
};

extractABI('HateMe', process.env.ABI_EXTRACT_DESTINATION);