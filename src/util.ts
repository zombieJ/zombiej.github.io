const getBase64 = function (file: File) {
  return new Promise((resolve) => {
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result);
    };
  });
};

export async function uploadFile(file: File) {
  const base64 = await getBase64(file);
  const body = new FormData();
  body.append('files', file, file.name);

  const { fileName } = await fetch('/data/assets/upload', {
    method: 'POST',
    body: JSON.stringify({
      name: file.name,
      base64,
    }),
    headers: {
      'content-type': 'application/json',
    },
  }).then((res) => res.json());

  return fileName;
}
