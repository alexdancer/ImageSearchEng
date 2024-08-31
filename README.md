## ImageSearchEng
 Create a Image Searcher using neural networks and vector databases

- **Use the local docker compose container from weaviate configurator with "img2vec-neural"**
  - Or make a docker-compose.yml file and paste this code:
  - <details>
    <summary>Code for docker-compose.yml</summary>

    ```
    ---
    services:
      weaviate:
        command:
        - --host
        - 0.0.0.0
        - --port
        - '8080'
        - --scheme
        - http
        image: cr.weaviate.io/semitechnologies/weaviate:1.26.3
        ports:
        - 8080:8080
        - 50052:50051
        volumes:
        - weaviate_data:/var/lib/weaviate
        restart: on-failure:0
        environment:
          QUERY_DEFAULTS_LIMIT: 25
          AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED: 'true'
          PERSISTENCE_DATA_PATH: '/var/lib/weaviate'
          ENABLE_MODULES: 'img2vec-neural'
          DEFAULT_VECTORIZER_MODULE: 'img2vec-neural'
          IMAGE_INFERENCE_API: "http://i2v-neural:8080"
          CLUSTER_HOSTNAME: 'node1'
      i2v-neural:
        image: cr.weaviate.io/semitechnologies/img2vec-pytorch:resnet50
    volumes:
      weaviate_data:
    ...
    ```
    </details>
  - Run the containers with _"docker-compose up -d"_ turn off with _"docker-compose down"_
* **Add your own images to the img folder and find an image for test.jpg**
+ **Run the image searcher by typing _"node index.js"_**