"use strict";

// Utility: remove Vietnamese tones and slugify
function removeVietnameseTones(input) {
	if (!input) return "";
	let str = input;
	str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/gi, "a");
	str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/gi, "e");
	str = str.replace(/ì|í|ị|ỉ|ĩ/gi, "i");
	str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/gi, "o");
	str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/gi, "u");
	str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/gi, "y");
	str = str.replace(/đ/gi, "d");
	// Remove combining diacritics
	str = str.replace(/[\u0300-\u036f]/g, "");
	// Normalize spacing and punctuation
	str = str.replace(/\s+/g, " ").trim();
	return str;
}

function slugify(input) {
	return removeVietnameseTones(String(input))
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")
		.replace(/^-|-$/g, "");
}

// Lightweight region knowledge base
const CITY_TO_REGION = {
	// Miền Bắc
	"ha noi": "Miền Bắc",
	"haiphong": "Miền Bắc",
	"hai phong": "Miền Bắc",
	"quang ninh": "Miền Bắc",
	"ninh binh": "Miền Bắc",
	"thai nguyen": "Miền Bắc",
	"hai duong": "Miền Bắc",
	"bac ninh": "Miền Bắc",
	"bac giang": "Miền Bắc",
	"vinh phuc": "Miền Bắc",
	"phu tho": "Miền Bắc",
	"hoa binh": "Miền Bắc",
	"lao cai": "Miền Bắc",
	"yen bai": "Miền Bắc",
	"son la": "Miền Bắc",
	"dien bien": "Miền Bắc",
	"lai chau": "Miền Bắc",
	"lang son": "Miền Bắc",
	"cao bang": "Miền Bắc",
	"tuyen quang": "Miền Bắc",
	"thai binh": "Miền Bắc",
	"nam dinh": "Miền Bắc",
	"ha nam": "Miền Bắc",
	"hung yen": "Miền Bắc",

	// Miền Trung
	"da nang": "Miền Trung",
	"thua thien hue": "Miền Trung",
	"hue": "Miền Trung",
	"quang tri": "Miền Trung",
	"quang binh": "Miền Trung",
	"quang nam": "Miền Trung",
	"quang ngai": "Miền Trung",
	"binh dinh": "Miền Trung",
	"phu yen": "Miền Trung",
	"khanh hoa": "Miền Trung",
	"nha trang": "Miền Trung",
	"ninh thuan": "Miền Trung",
	"binh thuan": "Miền Trung",
	"da lat": "Tây Nguyên",
	"lam dong": "Tây Nguyên",
	"gia lai": "Tây Nguyên",
	"kon tum": "Tây Nguyên",
	"dak lak": "Tây Nguyên",
	"dak nong": "Tây Nguyên",

	// Miền Nam
	"ho chi minh": "Miền Nam",
	"tp hcm": "Miền Nam",
	"tphcm": "Miền Nam",
	"can tho": "Miền Nam",
	"dong nai": "Miền Nam",
	"binh duong": "Miền Nam",
	"ba ria vung tau": "Miền Nam",
	"vung tau": "Miền Nam",
	"tay ninh": "Miền Nam",
	"binh phuoc": "Miền Nam",
	"long an": "Miền Nam",
	"tien giang": "Miền Nam",
	"ben tre": "Miền Nam",
	"tra vinh": "Miền Nam",
	"vinh long": "Miền Nam",
	"an giang": "Miền Nam",
	"dong thap": "Miền Nam",
	"kien giang": "Miền Nam",
	"hau giang": "Miền Nam",
	"soc trang": "Miền Nam",
	"bac lieu": "Miền Nam",
	"ca mau": "Miền Nam"
};

function detectRegion(cityName) {
	const normalized = slugify(cityName).replace(/-/g, " ");
	if (CITY_TO_REGION[normalized]) return CITY_TO_REGION[normalized];
	// Heuristics
	if (/ha noi|haiphong|hai phong|quang ninh|ninh binh|thai nguyen|hai duong|bac ninh|bac giang|vinh phuc|phu tho|hoa binh|lang son|tuyen quang|thai binh|nam dinh|ha nam|hung yen/.test(normalized)) {
		return "Miền Bắc";
	}
	if (/da nang|hue|thua thien hue|quang tri|quang binh|quang nam|quang ngai|binh dinh|phu yen|khanh hoa|ninh thuan|binh thuan/.test(normalized)) {
		return "Miền Trung";
	}
	if (/lam dong|da lat|gia lai|kon tum|dak lak|dak nong/.test(normalized)) {
		return "Tây Nguyên";
	}
	if (/ho chi minh|tp hcm|tphcm|can tho|dong nai|binh duong|vung tau|tay ninh|binh phuoc|long an|tien giang|ben tre|tra vinh|vinh long|an giang|dong thap|kien giang|hau giang|soc trang|bac lieu|ca mau/.test(normalized)) {
		return "Miền Nam";
	}
	return "Việt Nam";
}

function buildClimateSentence(region) {
	switch (region) {
		case "Miền Bắc":
			return "Khí hậu nhiệt đới gió mùa với bốn mùa rõ rệt: đông se lạnh, hè nóng ẩm.";
		case "Miền Trung":
			return "Thời tiết nắng nhiều, mưa theo mùa; đôi lúc chịu ảnh hưởng gió Lào và bão cuối năm.";
		case "Tây Nguyên":
			return "Cao nguyên mát mẻ, hai mùa mưa – khô rõ rệt, không khí dễ chịu quanh năm.";
		case "Miền Nam":
			return "Khí hậu nhiệt đới xích đạo, hai mùa mưa – khô, nắng ấm quanh năm.";
		default:
			return "Khí hậu nhiệt đới gió mùa điển hình của Việt Nam.";
	}
}

function buildHighlights(cityName, region) {
	const base = [];
	if (region === "Miền Bắc") base.push("văn hoá lâu đời", "ẩm thực phong phú", "nhiều di tích lịch sử");
	else if (region === "Miền Trung") base.push("biển đẹp", "ẩm thực đậm đà", "di sản văn hoá đặc sắc");
	else if (region === "Tây Nguyên") base.push("không khí trong lành", "thiên nhiên hùng vĩ", "cà phê trứ danh");
	else if (region === "Miền Nam") base.push("nhịp sống năng động", "ẩm thực đường phố", "nhiều kênh rạch miệt vườn");
	else base.push("con người thân thiện", "ẩm thực địa phương", "điểm tham quan hấp dẫn");
	return `${cityName} nổi tiếng với ${base.slice(0, 3).join(", ")}.`;
}

function buildBestTime(region) {
	switch (region) {
		case "Miền Bắc":
			return "Thời điểm lý tưởng để tham quan là mùa thu (9–11) hoặc mùa xuân (3–4).";
		case "Miền Trung":
			return "Nên đi từ 3–8 để hạn chế mưa bão cuối năm.";
		case "Tây Nguyên":
			return "Mùa khô (11–4) thích hợp cho tham quan và săn mây.";
		case "Miền Nam":
			return "Có thể đi quanh năm; mùa khô (12–4) thuận tiện di chuyển.";
		default:
			return "Có thể tham quan quanh năm tuỳ lịch trình cá nhân.";
	}
}

function toTitleCase(text) {
	return String(text)
		.toLowerCase()
		.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
}

function generateCityDescriptionItem(cityName, options) {
	const opts = Object.assign({ context: "general", maxLength: 0 }, options || {});
	const cleanName = (cityName || "").toString().trim();
	const prettyName = cleanName
		.replace(/^tp\.?\s*/i, "Thành phố ")
		.replace(/^thanh pho\s*/i, "Thành phố ")
		.replace(/^tinh\s*/i, "Tỉnh ");
	const region = detectRegion(cleanName);
	const climate = buildClimateSentence(region);
	const highlights = buildHighlights(prettyName, region);
	const bestTime = buildBestTime(region);

	const baseSentences = [
		`${prettyName} là một điểm đến thuộc ${region === "Việt Nam" ? "Việt Nam" : region + ", Việt Nam"}.`,
		climate,
		highlights,
		bestTime
	];

	let description = baseSentences.join(" ");
	if (opts.context === "weather") {
		description += " Dữ liệu thời tiết tại đây thường thay đổi theo mùa, bạn nên kiểm tra dự báo trước khi di chuyển.";
	}

	if (opts.maxLength && Number.isFinite(opts.maxLength) && opts.maxLength > 0) {
		if (description.length > opts.maxLength) {
			description = description.slice(0, opts.maxLength - 1).replace(/\s+\S*$/, "") + "…";
		}
	}

	return {
		name: prettyName,
		slug: slugify(cleanName),
		region,
		description,
		keywords: buildKeywords(prettyName, region, opts.context)
	};
}

function buildKeywords(cityName, region, context) {
	const tokens = [cityName, removeVietnameseTones(cityName), region, "du lịch", "điểm đến"];
	if (context === "weather") tokens.push("thời tiết", "nhiệt độ", "dự báo mưa");
	return Array.from(new Set(tokens.filter(Boolean))).map((t) => String(t));
}

function generateCityDescriptions(cityArray, options) {
	const inputList = Array.isArray(cityArray) ? cityArray : [];
	const uniqueNames = Array.from(new Set(inputList.map((c) => String(c || "").trim()).filter(Boolean)));
	return uniqueNames.map((city) => generateCityDescriptionItem(city, options));
}

// CLI support
function parseArgs(argv) {
	const args = {
		input: null,
		format: "json",
		context: "general",
		maxLength: 0,
		ai: null,
		model: "gpt-4o-mini",
		temperature: 0.7,
		maxTokens: 220
	};
	for (const raw of argv) {
		if (raw.startsWith("--format=")) args.format = raw.split("=")[1] || "json";
		else if (raw.startsWith("--context=")) args.context = raw.split("=")[1] || "general";
		else if (raw.startsWith("--maxLength=")) args.maxLength = parseInt(raw.split("=")[1], 10) || 0;
		else if (raw.startsWith("--ai=")) args.ai = (raw.split("=")[1] || "").toLowerCase();
		else if (raw.startsWith("--model=")) args.model = raw.split("=")[1] || args.model;
		else if (raw.startsWith("--temperature=")) args.temperature = parseFloat(raw.split("=")[1]) || args.temperature;
		else if (raw.startsWith("--maxTokens=")) args.maxTokens = parseInt(raw.split("=")[1], 10) || args.maxTokens;
		else if (!args.input) args.input = raw;
	}
	return args;
}

function tryReadInput(input) {
	const fs = require("fs");
	if (!input) return [];
	try {
		// If input looks like a path to a file
		if (/\.json$/i.test(input) || fs.existsSync(input)) {
			const content = fs.readFileSync(input, "utf8");
			return JSON.parse(content);
		}
		// Otherwise parse as inline JSON array
		return JSON.parse(input);
	} catch (err) {
		throw new Error("Không thể đọc input. Hãy truyền mảng JSON (vd: [\"Hà Nội\", \"Đà Nẵng\"]) hoặc đường dẫn file .json");
	}
}

function toMarkdown(items) {
	const lines = [];
	for (const item of items) {
		lines.push(`- **${item.name}** (${item.region})`);
		lines.push(`  - slug: ${item.slug}`);
		lines.push(`  - mô tả: ${item.description}`);
		lines.push(`  - từ khoá: ${item.keywords.join(", ")}`);
	}
	return lines.join("\n");
}

// ===== AI (OpenAI) integration =====
async function callOpenAIChat({ apiKey, model, temperature, maxTokens, messages }) {
	const axios = require("axios");
	const url = "https://api.openai.com/v1/chat/completions";
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${apiKey}`
	};
	const body = {
		model,
		temperature,
		max_tokens: maxTokens,
		messages
	};
	const res = await axios.post(url, body, { headers, timeout: 20000 });
	return res.data && res.data.choices && res.data.choices[0] && res.data.choices[0].message && res.data.choices[0].message.content
		? res.data.choices[0].message.content.trim()
		: "";
}

function buildAIPrompt(cityName, region, options) {
	const { context, maxLength } = options || {};
	const climate = buildClimateSentence(region);
	const highlights = buildHighlights(cityName, region);
	const bestTime = buildBestTime(region);
	const constraints = [];
	if (maxLength && Number.isFinite(maxLength) && maxLength > 0) {
		constraints.push(`Giới hạn tối đa ${maxLength} ký tự, ưu tiên ngắt câu tự nhiên.`);
	}
	if (context === "weather") {
		constraints.push("Ưu tiên lồng thông tin thời tiết theo mùa, khuyến nghị kiểm tra dự báo.");
	}
	return [
		`Viết đoạn mô tả ngắn gọn (1–3 câu) bằng tiếng Việt về \"${cityName}\" thuộc ${region}.`,
		`Bối cảnh: ${climate} ${highlights} ${bestTime}`,
		"Yêu cầu: tự nhiên, xúc tích, không liệt kê dạng danh sách, không thêm tiêu đề.",
		constraints.join(" ")
	].filter(Boolean).join("\n");
}

async function generateCityDescriptionItemAI(cityName, options) {
	const apiKey = process.env.OPENAI_API_KEY;
	if (!apiKey) throw new Error("Thiếu OPENAI_API_KEY trong biến môi trường.");
	const { model = "gpt-4o-mini", temperature = 0.7, maxTokens = 220 } = options || {};
	const cleanName = (cityName || "").toString().trim();
	const prettyName = cleanName
		.replace(/^tp\.?\s*/i, "Thành phố ")
		.replace(/^thanh pho\s*/i, "Thành phố ")
		.replace(/^tinh\s*/i, "Tỉnh ");
	const region = detectRegion(cleanName);
	const prompt = buildAIPrompt(prettyName, region, options);
	const messages = [
		{ role: "system", content: "Bạn là trợ lý viết nội dung du lịch ngắn gọn, giàu thông tin, tiếng Việt tự nhiên." },
		{ role: "user", content: prompt }
	];
	let aiText = await callOpenAIChat({ apiKey, model, temperature, maxTokens, messages });
	if (!aiText) {
		// Fallback: dùng mô tả quy tắc
		return generateCityDescriptionItem(cityName, options);
	}
	if (options && options.maxLength && Number.isFinite(options.maxLength) && options.maxLength > 0) {
		if (aiText.length > options.maxLength) {
			aiText = aiText.slice(0, options.maxLength - 1).replace(/\s+\S*$/, "") + "…";
		}
	}
	return {
		name: prettyName,
		slug: slugify(cleanName),
		region,
		description: aiText,
		keywords: buildKeywords(prettyName, region, options && options.context)
	};
}

async function generateCityDescriptionsAI(cityArray, options) {
	const inputList = Array.isArray(cityArray) ? cityArray : [];
	const uniqueNames = Array.from(new Set(inputList.map((c) => String(c || "").trim()).filter(Boolean)));
	const results = await Promise.all(uniqueNames.map((city) => generateCityDescriptionItemAI(city, options).catch(() => generateCityDescriptionItem(city, options))));
	return results;
}

if (require.main === module) {
	(async () => {
		const { input, format, context, maxLength, ai, model, temperature, maxTokens } = parseArgs(process.argv.slice(2));
		if (!input) {
			console.error("Cách dùng: node utils/cityDescriptions.js '[\"Hà Nội\",\"Đà Nẵng\"]' --format=json|md --context=general|weather --maxLength=160 [--ai=openai --model=gpt-4o-mini --temperature=0.7 --maxTokens=220]");
			process.exit(1);
		}
		const cities = tryReadInput(input);
		let items;
		if (ai === "openai") {
			try {
				items = await generateCityDescriptionsAI(cities, { context, maxLength, model, temperature, maxTokens });
			} catch (err) {
				// Nếu AI lỗi toàn cục, fallback toàn bộ
				items = generateCityDescriptions(cities, { context, maxLength });
			}
		} else {
			items = generateCityDescriptions(cities, { context, maxLength });
		}
		if (format === "md") {
			console.log(toMarkdown(items));
		} else {
			console.log(JSON.stringify(items, null, 2));
		}
	})().catch((e) => {
		console.error("Lỗi thực thi:", e && e.message ? e.message : e);
		process.exit(1);
	});
}

module.exports = {
	generateCityDescriptions,
	generateCityDescriptionItem,
	generateCityDescriptionsAI,
	generateCityDescriptionItemAI,
	slugify,
	removeVietnameseTones
};


