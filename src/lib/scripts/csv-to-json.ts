#!/usr/bin/env tsx

import 'dotenv/config'
import fs from 'fs'
import path from 'path'

interface CsvProduct {
  'S.N.': string
  'Product Name': string
  'Unit': string
  'Price': string
  'Categories': string
  'Images': string
  'Remarks ': string
  'col7': string
  'col8': string
}

interface JsonProduct {
  id: string
  name: string
  slug: string
  price: number
  unit: string
  discountPercent: number
  image: string
  images?: string[]
  shortDescription?: string
  variations?: Array<{
    name: string
    price: number
    discountPercent?: number
  }>
  defaultVariation?: string
  featured?: boolean
  bestseller?: boolean
}

interface JsonCategory {
  id: string
  name: string
  products: JsonProduct[]
}

interface JsonData {
  categories: JsonCategory[]
}

function parseCsvLine(line: string): CsvProduct {
  const values: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  
  return {
    'S.N.': values[0] || '',
    'Product Name': values[1] || '',
    'Unit': values[2] || '',
    'Price': values[3] || '',
    'Categories': values[4] || '',
    'Images': values[5] || '',
    'Remarks ': values[6] || '',
    'col7': values[7] || '',
    'col8': values[8] || ''
  }
}

function createSlug(name: string, unit: string = ''): string {
  let slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add unit information to make slug unique
  if (unit && unit.trim() !== '') {
    const unitSlug = unit
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
    
    if (unitSlug) {
      slug += `-${unitSlug}`
    }
  }
  
  return slug
}

function processImages(imageString: string): { image: string; images: string[] } {
  if (!imageString || imageString.trim() === '') {
    return {
      image: '/images/placeholder.png',
      images: ['/images/placeholder.png']
    }
  }
  
  // Split by comma and clean up image names
  const imageList = imageString
    .split(',')
    .map(img => img.trim())
    .filter(img => img.length > 0)
    .map(img => {
      // If image doesn't start with /images/, add the path
      if (!img.startsWith('/images/')) {
        return `/images/products/${img}`
      }
      return img
    })
  
  if (imageList.length === 0) {
    return {
      image: '/images/placeholder.png',
      images: ['/images/placeholder.png']
    }
  }
  
  return {
    image: imageList[0],
    images: imageList
  }
}

function categorizeProducts(products: JsonProduct[]): JsonCategory[] {
  const categoryMap = new Map<string, JsonProduct[]>()
  
  products.forEach(product => {
    // Extract categories from the product name and create category groups
    const categories = product.name.toLowerCase()
    
    let categoryId = 'other'
    
    if (categories.includes('chicken') || categories.includes('breast') || categories.includes('leg') || categories.includes('drumstick') || categories.includes('gizzard') || categories.includes('liver') || categories.includes('mince') || categories.includes('back bone') || categories.includes('lolly')) {
      categoryId = 'chicken'
    } else if (categories.includes('mutton') || categories.includes('buff') || categories.includes('vutton') || categories.includes('boka')) {
      categoryId = 'mutton-buff'
    } else if (categories.includes('pork') || categories.includes('bacon') || categories.includes('ham')) {
      categoryId = 'pork'
    } else if (categories.includes('fish') || categories.includes('basa')) {
      categoryId = 'fish'
    } else if (categories.includes('veg') || categories.includes('vegetable') || categories.includes('peas') || categories.includes('corn')) {
      categoryId = 'vegetarian'
    } else if (categories.includes('momo') || categories.includes('dumpling')) {
      categoryId = 'momo'
    } else if (categories.includes('nugget') || categories.includes('cutlet') || categories.includes('burger') || categories.includes('ball')) {
      categoryId = 'ready-to-cook'
    } else if (categories.includes('french') || categories.includes('fry') || categories.includes('tikki')) {
      categoryId = 'frozen-snacks'
    }
    
    if (!categoryMap.has(categoryId)) {
      categoryMap.set(categoryId, [])
    }
    categoryMap.get(categoryId)!.push(product)
  })
  
  return Array.from(categoryMap.entries()).map(([id, products]) => {
    const getCategoryName = (categoryId: string): string => {
      switch (categoryId) {
        case 'chicken': return 'Chicken Items'
        case 'mutton-buff': return 'Mutton & Buff Items'
        case 'pork': return 'Pork Items'
        case 'fish': return 'Fish Items'
        case 'vegetarian': return 'Vegetarian Items'
        case 'momo': return 'Mo:Mo & Dumplings'
        case 'ready-to-cook': return 'Ready to Cook'
        case 'frozen-snacks': return 'Frozen Snacks'
        default: return 'Other Items'
      }
    }
    
    return {
      id,
      name: getCategoryName(id),
      products
    }
  })
}

async function convertCsvToJson() {
  try {
    console.log('🔄 Converting CSV to JSON...')
    
    // Read CSV file
    const csvPath = path.join(process.cwd(), 'public', 'data', 'actual-products.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const lines = csvContent.split('\n').filter(line => line.trim())
    
    // Skip header row
    const dataLines = lines.slice(1)
    
    const products: JsonProduct[] = []
    
    dataLines.forEach((line, index) => {
      if (line.trim() === '') return
      
      try {
        const csvProduct = parseCsvLine(line)
        
        // Skip if essential data is missing
        if (!csvProduct['Product Name'] || csvProduct['Product Name'].trim() === '') {
          return
        }
        
        const price = parseFloat(csvProduct['Price']) || 0
        const unit = csvProduct['Unit'] || 'per kg'
        
        // Process images
        const { image, images } = processImages(csvProduct['Images'])
        
        const slug = createSlug(csvProduct['Product Name'], unit)
        
        // Determine if product should be featured or bestseller
        const productName = csvProduct['Product Name'].toLowerCase()
        const isFeatured = productName.includes('chicken') && (
          productName.includes('sausage') || 
          productName.includes('nuggets') || 
          productName.includes('mince') ||
          productName.includes('fresh')
        ) || productName.includes('momo') || productName.includes('tikki')
        
        const isBestseller = productName.includes('chicken') && (
          productName.includes('sausage') || 
          productName.includes('nuggets')
        ) || productName.includes('momo') || productName.includes('french fry')
        
        const product: JsonProduct = {
          id: slug,
          name: csvProduct['Product Name'].trim(),
          slug: slug,
          price,
          unit,
          discountPercent: 0, // No discount data in CSV
          image,
          images,
          shortDescription: `Premium quality ${csvProduct['Product Name'].toLowerCase()}`,
          featured: isFeatured,
          bestseller: isBestseller
        }
        
        products.push(product)
        
      } catch (error) {
        console.warn(`⚠️  Skipping line ${index + 2}: ${error}`)
      }
    })
    
    // Categorize products
    const categories = categorizeProducts(products)
    
    const jsonData: JsonData = {
      categories
    }
    
    // Write JSON file
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'products.json')
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2))
    
    console.log('✅ CSV to JSON conversion completed!')
    console.log(`📊 Summary:`)
    console.log(`   - Total products: ${products.length}`)
    console.log(`   - Categories: ${categories.length}`)
    console.log(`   - Products with images: ${products.filter(p => p.image !== '/images/placeholder.png').length}`)
    console.log(`   - Products with placeholder: ${products.filter(p => p.image === '/images/placeholder.png').length}`)
    
    // Show category breakdown
    console.log('\n📋 Categories:')
    categories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.products.length} products`)
    })
    
    return { success: true, data: jsonData }
    
  } catch (error) {
    console.error('❌ Conversion failed:', error)
    return { success: false, error }
  }
}

async function main() {
  const result = await convertCsvToJson()
  
  if (result.success) {
    console.log('🎉 All done!')
    process.exit(0)
  } else {
    console.error('💥 Conversion failed')
    process.exit(1)
  }
}

main().catch((error) => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})
