#!/usr/bin/env node
/**
 * Landed Cost Calculator
 * Input: product price (CNY/USD), weight (kg), category
 * Output: total cost breakdown including shipping, taxes, agent fees
 */

function calculateLandedCost(priceCNY, weightKg, category = 'general', country = 'BR') {
    const USD_CNY = 7.25;
    const priceUSD = priceCNY / USD_CNY;
    
    // Shipping estimates
    const shippingAir = weightKg * 8; // $8/kg air
    const shippingSea = Math.max(weightKg * 2, 15); // $2/kg sea, min $15
    
    // Agent fee (5% of product price)
    const agentFee = priceUSD * 0.05;
    
    // Import duties (varies by category)
    const dutyRates = {
        'electronics': 0.0,
        'clothing': 0.12,
        'home': 0.04,
        'toys': 0.0,
        'general': 0.06,
    };
    const dutyRate = dutyRates[category] || 0.06;
    const duty = priceUSD * dutyRate;
    
    // VAT varies by country
    const vatRates = { BR: 0.23, US: 0, EU: 0.21, UK: 0.20, JP: 0.10, AU: 0.10 };
    const vatRate = vatRates[country] || 0.23;
    const vatBase = priceUSD + shippingSea + duty;
    const vat = vatBase * vatRate;
    
    // Total landed cost
    const totalAir = priceUSD + shippingAir + agentFee + duty + vat;
    const totalSea = priceUSD + shippingSea + agentFee + duty + vat;
    
    return {
        product: { cny: priceCNY, usd: +priceUSD.toFixed(2) },
        shipping: { air: +shippingAir.toFixed(2), sea: +shippingSea.toFixed(2) },
        agentFee: +agentFee.toFixed(2),
        duty: { rate: dutyRate, amount: +duty.toFixed(2) },
        vat: { rate: vatRate, amount: +vat.toFixed(2) },
        total: { air: +totalAir.toFixed(2), sea: +totalSea.toFixed(2) },
        perUnit: { air: +totalAir.toFixed(2), sea: +totalSea.toFixed(2) },
    };
}

// Export for use
if (typeof module !== 'undefined') module.exports = { calculateLandedCost };

// Demo
const result = calculateLandedCost(50, 0.5, 'electronics', 'BR');
console.log('Landed Cost Calculator');
console.log('Product: ¥50 (~$7) | Category: electronics | Country: BR');
console.log(`  Shipping (air): $${result.shipping.air}`);
console.log(`  Shipping (sea): $${result.shipping.sea}`);
console.log(`  Agent fee: $${result.agentFee}`);
console.log(`  Duty: $${result.duty.amount}`);
console.log(`  VAT (${(result.vat.rate * 100).toFixed(0)}%): $${result.vat.amount}`);
console.log(`  ---`);
console.log(`  Total (air): $${result.total.air}`);
console.log(`  Total (sea): $${result.total.sea}`);
