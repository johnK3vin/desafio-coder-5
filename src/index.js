import express from "express";
import multer from "multer";
import { ProductManager } from "./helpers/productManager.js";
//rutas
import prodsRouter from "./routes/products.routes.js";
import cartRouter from "./routes/carts.routes.js";

//handlebers
import { engine } from "express-handlebars";

import { __dirname } from "./path.js";
import path from "path";

import { Server } from "socket.io";

const PORT = 8080;
const app = express();
const productManager = new ProductManager();

//config de multer utilizando diskStorage
const storage = multer.diskStorage({
  //destination se utiliza para determinar en que carpeta se almacenara los archivos subidos
  destination: (req, file, cb) => {
    //callbacks
    cb(null, "src/public/img");
  },
  //filename es usado para determinar como deberia ser nombrado el archivo de la carpeta.
  filename: (res, file, cb) => {
    cb(null, `${Date.now()}${file.originalname}`);
  },
});

const server = app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});

//middlaware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "/public")));

//configuracion para trabajar con handlebars
app.engine("handlebars", engine()); //defino el motor de plantilla
app.set("view engine", "handlebars");
app.set("views", path.resolve(__dirname, "./views")); //resolver rutas absolutas a traves de rutas relativas

//multer
const upload = multer({ storage: storage });

//server socket.io
const io = new Server(server);

//establecer conexion
io.on("connection", async (socket) => {
  console.log("Servidos Socket.io conectado");
  //esperando un 'mensaje'
  socket.on("nuevoProd", async (prod) => {
    console.log(prod);
    try {
      const {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        category,
      } = prod;
      return await productManager.addProduct(
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        category
      );
    } catch (error) {
      console.log("index:", error);
    }
  });
  socket.emit("listProd", listProd);
});

//Routers
app.use("/api/products", prodsRouter);
app.use("/api/carts", cartRouter);

let listProd = [];

const cargarProd = async () => {
  try {
    listProd = await productManager.getProducts();
  } catch (error) {
    console.error("Error: al llamar productos");
  }
};
cargarProd();

// app.get("/home",(req, res) => {

//   res.render("home", {
//     title: "home - productos",
//     product: listProd,
//     css: "homeStyle.css",
//     js: "home.js"
//   })
// })

app.get("/static/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", {
    title: "Agregar Producto",
    css: "realTimeStyle.css",
    js: "realTimeProducts.js",
  });
});

app.get("/static/home", (req, res) => {
  res.render("home", {
    title: "home - productos",
    product: listProd,
    css: "homeStyle.css",
    js: "home.js",
  });
});

app.post("/upload", upload.single("product"), (req, res) => {
  console.log(req.file);
  console.log(req.body);
});
