/**
 * Script untuk generate data produk dummy
 * Jalankan dengan: npx tsx scripts/generate-data.ts
 */

import * as fs from "fs";
import * as path from "path";

// Konfigurasi jumlah data
const TOTAL_PRODUCTS = 2000;

// Data master untuk generate produk
const categories = [
    { name: "Laptop", priceRange: [4000000, 35000000] },
    { name: "Smartphone", priceRange: [1500000, 20000000] },
    { name: "Tablet", priceRange: [2000000, 15000000] },
    { name: "TV", priceRange: [2000000, 50000000] },
    { name: "Headphone", priceRange: [100000, 5000000] },
    { name: "Earbuds", priceRange: [50000, 3000000] },
    { name: "Smartwatch", priceRange: [200000, 10000000] },
    { name: "Kamera", priceRange: [3000000, 50000000] },
    { name: "Speaker", priceRange: [100000, 10000000] },
    { name: "Monitor", priceRange: [1000000, 20000000] },
    { name: "Keyboard", priceRange: [50000, 3000000] },
    { name: "Mouse", priceRange: [30000, 2000000] },
    { name: "Printer", priceRange: [500000, 10000000] },
    { name: "Router", priceRange: [200000, 5000000] },
    { name: "SSD", priceRange: [200000, 5000000] },
    { name: "RAM", priceRange: [200000, 3000000] },
    { name: "Power Bank", priceRange: [50000, 1000000] },
    { name: "Charger", priceRange: [20000, 500000] },
    { name: "Kipas Angin", priceRange: [100000, 2000000] },
    { name: "AC", priceRange: [3000000, 15000000] },
    { name: "Kulkas", priceRange: [2000000, 20000000] },
    { name: "Mesin Cuci", priceRange: [2000000, 15000000] },
    { name: "Microwave", priceRange: [500000, 5000000] },
    { name: "Blender", priceRange: [100000, 2000000] },
    { name: "Rice Cooker", priceRange: [200000, 3000000] },
];

const brands: Record<string, string[]> = {
    Laptop: ["ASUS", "Acer", "Lenovo", "HP", "Dell", "MSI", "Apple", "Gigabyte", "Huawei", "Microsoft"],
    Smartphone: ["Samsung", "Apple", "Xiaomi", "OPPO", "Vivo", "Realme", "OnePlus", "Google", "Sony", "Huawei"],
    Tablet: ["Apple", "Samsung", "Xiaomi", "Lenovo", "Huawei", "Microsoft", "ASUS", "Realme"],
    TV: ["Samsung", "LG", "Sony", "TCL", "Xiaomi", "Hisense", "Polytron", "Sharp", "Panasonic", "Toshiba"],
    Headphone: ["Sony", "JBL", "Audio-Technica", "Sennheiser", "Bose", "AKG", "Beyerdynamic", "Razer", "SteelSeries", "HyperX"],
    Earbuds: ["Apple", "Samsung", "Sony", "JBL", "Xiaomi", "Realme", "OnePlus", "Huawei", "Nothing", "Jabra"],
    Smartwatch: ["Apple", "Samsung", "Garmin", "Fitbit", "Xiaomi", "Amazfit", "Huawei", "OPPO", "Realme"],
    Kamera: ["Canon", "Nikon", "Sony", "Fujifilm", "Panasonic", "Olympus", "Leica", "GoPro"],
    Speaker: ["JBL", "Bose", "Sony", "Harman Kardon", "Marshall", "Bang & Olufsen", "Sonos", "Ultimate Ears"],
    Monitor: ["ASUS", "LG", "Samsung", "Dell", "BenQ", "AOC", "Acer", "ViewSonic", "MSI", "Gigabyte"],
    Keyboard: ["Logitech", "Razer", "Corsair", "SteelSeries", "Ducky", "Keychron", "Royal Kludge", "Rexus", "Fantech"],
    Mouse: ["Logitech", "Razer", "Corsair", "SteelSeries", "Pulsar", "Lamzu", "Zowie", "Glorious", "Fantech"],
    Printer: ["HP", "Canon", "Epson", "Brother", "Xerox", "Ricoh", "Fuji Xerox"],
    Router: ["TP-Link", "ASUS", "Netgear", "Linksys", "D-Link", "Xiaomi", "Huawei", "Tenda"],
    SSD: ["Samsung", "WD", "Kingston", "Crucial", "Sandisk", "Seagate", "Adata", "Patriot"],
    RAM: ["Corsair", "G.Skill", "Kingston", "Team", "Adata", "Patriot", "V-Gen", "Crucial"],
    "Power Bank": ["Anker", "Xiaomi", "Baseus", "Romoss", "Aukey", "Zola", "Vivan", "Samsung"],
    Charger: ["Anker", "Baseus", "Xiaomi", "Ugreen", "Aukey", "Belkin", "Samsung", "Apple"],
    "Kipas Angin": ["Cosmos", "Maspion", "Miyako", "Panasonic", "Sanken", "Sekai", "Kris", "National"],
    AC: ["Daikin", "Panasonic", "LG", "Samsung", "Sharp", "Gree", "Midea", "Haier", "TCL"],
    Kulkas: ["Samsung", "LG", "Sharp", "Panasonic", "Polytron", "Aqua", "Sanken", "Electrolux"],
    "Mesin Cuci": ["Samsung", "LG", "Sharp", "Panasonic", "Polytron", "Aqua", "Electrolux", "Midea"],
    Microwave: ["Samsung", "LG", "Sharp", "Panasonic", "Electrolux", "Modena", "Oxone"],
    Blender: ["Philips", "Miyako", "Cosmos", "Maspion", "Panasonic", "Sharp", "Oxone", "National"],
    "Rice Cooker": ["Philips", "Miyako", "Cosmos", "Yong Ma", "Sharp", "Panasonic", "Cuckoo", "Zojirushi"],
};

const productTypes: Record<string, string[]> = {
    Laptop: ["Gaming", "Ultrabook", "2-in-1", "Workstation", "Chromebook", "Business", "Student"],
    Smartphone: ["Pro", "Pro Max", "Ultra", "Plus", "Lite", "Neo", "5G", "Note", "Fold", "Flip"],
    Tablet: ["Pro", "Air", "Mini", "Pad", "Tab", "MatePad"],
    TV: ["OLED", "QLED", "LED", "Smart TV", "Android TV", "UHD", "4K", "8K"],
    Headphone: ["Wireless", "Gaming", "Studio", "Noise Cancelling", "Over-Ear", "On-Ear"],
    Earbuds: ["Pro", "Buds", "Air", "Free", "Live", "Sport"],
    Smartwatch: ["Pro", "Ultra", "Classic", "Active", "Fit", "Sport", "SE"],
    Kamera: ["Mirrorless", "DSLR", "Action Cam", "Compact", "Instant", "Vlog"],
    Speaker: ["Portable", "Bluetooth", "Soundbar", "Party", "Home Theater", "Desktop"],
    Monitor: ["Gaming", "Ultrawide", "Curved", "4K", "IPS", "VA", "TN", "OLED"],
    Keyboard: ["Mechanical", "Membrane", "Wireless", "Gaming", "TKL", "60%", "75%"],
    Mouse: ["Gaming", "Wireless", "Ergonomic", "Ultralight", "Vertical"],
    Printer: ["Inkjet", "Laser", "All-in-One", "Photo", "Thermal"],
    Router: ["WiFi 6", "WiFi 6E", "Mesh", "Gaming", "Range Extender"],
    SSD: ["NVMe", "SATA", "Portable", "M.2", "2.5 inch"],
    RAM: ["DDR4", "DDR5", "RGB", "Low Profile", "Gaming"],
    "Power Bank": ["Fast Charging", "Wireless", "Solar", "Slim", "Mini", "20000mAh", "10000mAh"],
    Charger: ["Fast Charging", "GaN", "Multi Port", "Wireless", "Car Charger"],
    "Kipas Angin": ["Berdiri", "Duduk", "Dinding", "Tornado", "Tower"],
    AC: ["Standard", "Inverter", "Low Watt", "Portable", "Split", "Cassette"],
    Kulkas: ["1 Pintu", "2 Pintu", "Side by Side", "French Door", "Mini"],
    "Mesin Cuci": ["Top Load", "Front Load", "2 Tabung", "Pengering"],
    Microwave: ["Solo", "Grill", "Convection"],
    Blender: ["Tangan", "Countertop", "Portable", "High Power"],
    "Rice Cooker": ["Digital", "Analog", "Low Carbo", "Multi Cooker"],
};

// Helper functions
function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePrice(min: number, max: number): number {
    // Round to nearest 50000 for more realistic prices
    const price = random(min, max);
    return Math.round(price / 50000) * 50000;
}

function generateDescription(category: string, brand: string, type: string): string {
    const features = [
        "kualitas premium",
        "garansi resmi",
        "original 100%",
        "hemat energi",
        "desain modern",
        "mudah digunakan",
        "performa tinggi",
        "tahan lama",
        "multifungsi",
        "teknologi terbaru",
    ];

    const picked = [];
    const count = random(2, 4);
    const shuffled = [...features].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
        picked.push(shuffled[i]);
    }

    return `${brand} ${type} ${category} dengan ${picked.join(", ")}`;
}

// Generate products
function generateProducts(): Array<Record<string, string | number>> {
    const products: Array<Record<string, string | number>> = [];

    for (let i = 0; i < TOTAL_PRODUCTS; i++) {
        const category = randomElement(categories);
        const categoryName = category.name;
        const brand = randomElement(brands[categoryName] || ["Generic"]);
        const type = randomElement(productTypes[categoryName] || ["Standard"]);
        const model = `${random(1, 999)}`.padStart(3, "0");

        const productName = `${brand} ${categoryName} ${type} ${model}`;
        const price = generatePrice(category.priceRange[0], category.priceRange[1]);
        const stock = random(0, 500);
        const warranty = randomElement([6, 12, 24, 36]);
        const rating = (random(30, 50) / 10).toFixed(1);
        const sold = random(0, 10000);

        products.push({
            nama_produk: productName,
            kategori: categoryName,
            merek: brand,
            tipe: type,
            harga: price,
            stok: stock,
            garansi_bulan: warranty,
            rating: parseFloat(rating),
            terjual: sold,
            deskripsi: generateDescription(categoryName, brand, type),
        });
    }

    return products;
}

// Convert to CSV
function toCSV(data: Array<Record<string, string | number>>): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const rows = data.map(row =>
        headers.map(h => {
            const value = row[h];
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
        }).join(",")
    );

    return [headers.join(","), ...rows].join("\n");
}

// Main
function main() {
    console.log(`Generating ${TOTAL_PRODUCTS} products...`);

    const products = generateProducts();
    const csv = toCSV(products);

    // Save to sample-data folder
    const outputDir = path.join(process.cwd(), "sample-data");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, "products-2000.csv");
    fs.writeFileSync(outputPath, csv, "utf-8");

    console.log(`✅ Generated ${TOTAL_PRODUCTS} products`);
    console.log(`📁 Saved to: ${outputPath}`);

    // Print sample
    console.log("\n📊 Sample data:");
    console.log(products.slice(0, 3));
}

main();
