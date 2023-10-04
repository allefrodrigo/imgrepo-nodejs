const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const bodyParser = require('body-parser');
const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));


const storage = multer.diskStorage({
  destination: path.join(__dirname, "images"),
  filename: (req, file, cb) => {
    const fileExtension = file.originalname.split(".").pop(); // Alteração aqui
    cb(null, file.fieldname + "-" + Date.now() + "." + fileExtension);
  },
});

const upload = multer({ storage });
app.post("/upload", upload.single("image"), (req, res) => {
  const image = req.file;

  if (!image) {
    res.status(400).send({
      message: "Nenhuma imagem recebida.",
    });
  } else {
    // Medir o tempo antes e depois do upload
    const startTime = Date.now();
    const endTime = Date.now();

    // Calcular a quantidade de MB recebidos
    const fileSizeInMB = image.size / (1024 * 1024);

    console.log(`Upload de ${fileSizeInMB.toFixed(2)} MB concluído em ${(endTime - startTime) / 1000} segundos`);

    res.status(201).send({
      message: "Imagem carregada com sucesso",
      filename: image.filename,
    });
  }
});

app.post("/upload/:filename", upload.single("image"), (req, res) => {
  const image = req.file;
  const customFilename = req.params.filename;

  if (!image) {
    res.status(400).send({
      message: "Nenhuma imagem recebida.",
    });
  } else {
    const fileExtension = image.originalname.split(".").pop();
    const newFilename = customFilename + "-" + Date.now() + "." + fileExtension;

    fs.renameSync(image.path, path.join(__dirname, "images", newFilename));

    res.status(201).send({
      message: "Imagem carregada com sucesso",
      filename: newFilename,
    });
  }
});


app.get("/images/:filename", (req, res) => {
  const filename = req.params.filename;

  const imagePath = path.join(__dirname, "images", filename);

  if (!fs.existsSync(imagePath)) {
    res.status(404).send("Imagem não encontrada.");
  } else {
    res.sendFile(imagePath);
  }
});

app.get("/listImages", (req, res) => {
  const imageDirectory = path.join(__dirname, "images");

  fs.readdir(imageDirectory, (err, files) => {
    if (err) {
      res.status(500).send("Erro ao listar imagens.");
    } else {
      const imageFiles = files.filter((file) => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file);
      });

      res.status(200).json(imageFiles);
    }
  });
});

app.listen(3000, () => {
  console.log("API de hospedagem de imagem em execução na porta 3000");
});
