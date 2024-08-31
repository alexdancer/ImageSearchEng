import weaviate from 'weaviate-ts-client';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

const schemaRes = await client.schema.getter().do();

const classExists = schemaRes.classes.some(cls => cls.class === 'Meme');

console.log(schemaRes)

if (!classExists) {
  const schemaConfig = {
    class: "Meme",
    vectorizer: "img2vec-neural",
    vectorIndexType: "hnsw",
    moduleConfig: {
      "img2vec-neural": {
        imageFields: ["image"],
      },
    },
    properties: [
      {
        name: "image",
        dataType: ["blob"],
      },
      {
        name: "text",
        dataType: ["string"],
      },
    ],
  };

  await client.schema.classCreator().withClass(schemaConfig).do();
  console.log("Created class Meme");
} else {
  
}

const toBase64 = (filePath) => {
  const img = readFileSync(filePath);
  return Buffer.from(img).toString('base64');
};

const imgFiles = readdirSync("./img");

const promises = imgFiles.map(async (imgFile) => {
  const b64 = toBase64(`./img/${imgFile}`);

  await client.data.creator()
    .withClassName("Meme")
    .withProperties({
      image: b64,
      text: imgFile.split(".")[0].split("_").join(" "),
    })
    .do();
});

await Promise.all(promises);

const test = Buffer.from(readFileSync("./test.jpg")).toString("base64");

const resImage = await client.graphql
  .get()
  .withClassName("Meme")
  .withFields(["image"])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Write result to filesystem
const result = resImage.data.Get.Meme[0].image;
writeFileSync("./result.jpg", result, "base64");