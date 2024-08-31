import weaviate from 'weaviate-ts-client';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const client = weaviate.client({
    scheme: 'http',
    host: 'localhost:8080',
});

const schemaRes = await client.schema.getter().do();

const classExists = schemaRes.classes.some(cls => cls.class === 'Meme');

console.log(schemaRes)

// Creates the schema of meme
// Vectorizer database: img2vec-neural
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
} else {console.log("Class Meme already exists")}

// Function to convert image to base64
const toBase64 = (filePath) => {
  const img = readFileSync(filePath);
  return Buffer.from(img).toString('base64');
};


// Reads all images from the img folder
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

// Query to get the image most similar to the test image
const test = Buffer.from(readFileSync("./test.jpg")).toString("base64");

const resImage = await client.graphql
  .get()
  .withClassName("Meme")
  .withFields(["image"])
  .withNearImage({ image: test })
  .withLimit(1)
  .do();

// Writes the result image to the result.jpg file
const result = resImage.data.Get.Meme[0].image;
writeFileSync("./result.jpg", result, "base64");