import { productsService } from "../feature/products/repository/products.service.js";
import { cartsService } from "../feature/carts/repository/carts.service.js";
import { logger } from "../utils/logger/logger.js";

const RedirectHome = (req, res) => {
	res.redirect("/");
	// logger.info("🟢 Redireccionado a la página de inicio");
};

const Home = async (req, res) => {
	try {
		const products = await productsService.getAll({}, { limit: 20 });
		res.render("components/user/index", {
			layout: "main",
			user: {
				title: "ILICITO || HOME",
				js: "index.js",
				products: products.docs,
				...req.infoUser,
			},
		});
		// logger.info("🟢 Página de inicio renderizada con éxito");
	} catch (error) {
		logger.error(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
	}
};

const Products = async (req, res) => {
	try {
		const products = await productsService.getAll({}, { limit: 20 });
		res.render("components/user/shop", {
			layout: "main",
			user: {
				title: "Productos",
				section_title: "PRODUCTOS",
				products: products.docs,
				...req.infoUser,
			},
		});
		// logger.info("🟢 Página de productos renderizada con éxito");
	} catch (error) {
		logger.error(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
		res.redirect("/login");
	}
};

const ProductsSection = async (req, res) => {
	try {
		const query = {};
		const options = {};
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 20;

		const pricemax = parseInt(req.query.pricemax) || 100000000;
		const pricemin = parseInt(req.query.pricemin) || 0;

		const category = req.query.categoria || "";
		query.price = { $gte: pricemin, $lte: pricemax };
		req.params.section !== "promocion"
			? (query.type = req.params.section)
			: (query.promocion = true);

		if (category !== "") query.category = { $in: category };
		options.page = page;
		options.limit = limit;

		const paginate = await productsService.getAll(query, options);
		res.render("components/user/shop", {
			layout: "main",
			user: {
				title: "Productos",
				section_title: "PRODUCTOS",
				products: paginate.docs,
				...req.infoUser,
			},
		});
		// logger.info("🟢 Sección de productos renderizada con éxito");
	} catch (error) {
		logger.error(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
		res.status(500).send({ error: "Error interno del servidor" });
	}
};

const ProductDetail = async (req, res) => {
	try {
		const product = await productsService.getById(req.params.id);
		const stockproduct = product.stock > 0;
		const title = product.title.toLowerCase();
		if (!product) res.status(404).send({ error: "Producto no encontrado" });
		res.render("components/user/product", {
			layout: "main",
			user: {
				title,
				product,
				stockproduct,
				...req.infoUser,
			},
		});
		// logger.info(`🟢 Detalle del producto ${title} renderizado con éxito`);
	} catch (error) {
		logger.error(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
		res.status(500).render("404");
	}
};

const Contact = (req, res) => {
	res.render("components/user/contact", {
		layout: "main",
		user: {
			title: "Contacto",
			...req.infoUser,
		},
	});
	// logger.info("🟢 Página de contacto renderizada con éxito");
};

const CardID = async (req, res) => {
	try {
		const cid = req.params.cid;
		const totalProd = await cartsService.getByIdPopulate(cid);
		const products = totalProd.products.map(e => {
			return {
				...e.pid,
				quantity: e.quantity,
				confirm: e.quantity > e.pid.stock,
				cid: totalProd._id,
			};
		});
		res.render("components/user/cart", {
			layout: "main",
			user: {
				title: "Carrito",
				products_cart: products,
				...req.infoUser,
				permit: !products.find(e => e.confirm),
			},
		});
		// logger.info("🟢 Carrito renderizado con éxito");
	} catch (error) {
		logger.error(`🔴 Error al procesar la solicitud: ${error.message}`, {
			stack: error.stack,
		});
	}
};

export const controllersViewClient = {
	RedirectHome,
	Home,
	Products,
	ProductsSection,
	ProductDetail,
	Contact,
	CardID,
};
