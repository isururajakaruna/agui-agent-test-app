#!/usr/bin/env node

/**
 * Invocation-Level Deep Comparison
 * Compares the first invocation structure in detail, level by level
 */

const fs = require('fs');
const path = require('path');

// Read the two files
const referencePath = path.join(__dirname, 'reference_docs', 'eval-reference-evalset.json');
const comparePath = path.join(__dirname, 'reference_docs', 'compare.evalset.json');

const reference = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));
const compare = JSON.parse(fs.readFileSync(comparePath, 'utf-8'));

// Get first invocations
const refInv = reference.eval_cases[0].conversation[0];
const cmpInv = compare.eval_cases[0].conversation[0];

console.log('='.repeat(80));
console.log('INVOCATION STRUCTURE COMPARISON - LEVEL BY LEVEL');
console.log('='.repeat(80));
console.log('');

function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

function compareKeys(ref, cmp, label, indent = 0) {
  const spaces = '  '.repeat(indent);
  const refKeys = Object.keys(ref || {}).sort();
  const cmpKeys = Object.keys(cmp || {}).sort();
  
  const missing = refKeys.filter(k => !cmpKeys.includes(k));
  const extra = cmpKeys.filter(k => !refKeys.includes(k));
  const common = refKeys.filter(k => cmpKeys.includes(k));
  
  console.log(`${spaces}📍 ${label}`);
  console.log(`${spaces}${'─'.repeat(60)}`);
  
  if (missing.length === 0 && extra.length === 0) {
    console.log(`${spaces}✅ PERFECT MATCH - All properties present`);
  }
  
  if (missing.length > 0) {
    console.log(`${spaces}❌ MISSING in compare:`);
    missing.forEach(k => {
      const type = getType(ref[k]);
      const preview = type === 'string' ? (ref[k].length > 50 ? ref[k].substring(0, 50) + '...' : ref[k]) : '';
      console.log(`${spaces}   - "${k}" (${type})${preview ? ': ' + preview : ''}`);
    });
  }
  
  if (extra.length > 0) {
    console.log(`${spaces}⚠️  EXTRA in compare:`);
    extra.forEach(k => {
      const type = getType(cmp[k]);
      const preview = type === 'string' ? (cmp[k].length > 50 ? cmp[k].substring(0, 50) + '...' : cmp[k]) : '';
      console.log(`${spaces}   - "${k}" (${type})${preview ? ': ' + preview : ''}`);
    });
  }
  
  if (common.length > 0) {
    console.log(`${spaces}✔️  Common: ${common.join(', ')}`);
    
    // Check for type mismatches in common keys
    for (const key of common) {
      const refType = getType(ref[key]);
      const cmpType = getType(cmp[key]);
      if (refType !== cmpType) {
        console.log(`${spaces}   ⚠️  TYPE MISMATCH on "${key}": ${refType} vs ${cmpType}`);
      }
    }
  }
  
  console.log('');
  return { missing, extra, common };
}

// Level 1: Top-level invocation properties
console.log('🔍 LEVEL 1: INVOCATION TOP LEVEL');
console.log('─'.repeat(80));
const level1 = compareKeys(refInv, cmpInv, 'invocation', 0);

// Level 2: user_content
if (refInv.user_content && cmpInv.user_content) {
  console.log('🔍 LEVEL 2: user_content');
  console.log('─'.repeat(80));
  const level2a = compareKeys(refInv.user_content, cmpInv.user_content, 'user_content', 0);
  
  // Level 3: user_content.parts
  if (refInv.user_content.parts && cmpInv.user_content.parts) {
    console.log('🔍 LEVEL 3: user_content.parts[]');
    console.log('─'.repeat(80));
    console.log(`Reference has ${refInv.user_content.parts.length} parts`);
    console.log(`Compare has ${cmpInv.user_content.parts.length} parts`);
    
    if (refInv.user_content.parts.length > 0 && cmpInv.user_content.parts.length > 0) {
      const level3a = compareKeys(
        refInv.user_content.parts[0],
        cmpInv.user_content.parts[0],
        'user_content.parts[0]',
        0
      );
    }
  }
}

// Level 2: final_response
if (refInv.final_response && cmpInv.final_response) {
  console.log('🔍 LEVEL 2: final_response');
  console.log('─'.repeat(80));
  const level2b = compareKeys(refInv.final_response, cmpInv.final_response, 'final_response', 0);
  
  // Level 3: final_response.parts
  if (refInv.final_response.parts && cmpInv.final_response.parts) {
    console.log('🔍 LEVEL 3: final_response.parts[]');
    console.log('─'.repeat(80));
    console.log(`Reference has ${refInv.final_response.parts.length} parts`);
    console.log(`Compare has ${cmpInv.final_response.parts.length} parts`);
    
    if (refInv.final_response.parts.length > 0 && cmpInv.final_response.parts.length > 0) {
      const level3b = compareKeys(
        refInv.final_response.parts[0],
        cmpInv.final_response.parts[0],
        'final_response.parts[0]',
        0
      );
    }
  }
}

// Level 2: intermediate_data
if (refInv.intermediate_data && cmpInv.intermediate_data) {
  console.log('🔍 LEVEL 2: intermediate_data');
  console.log('─'.repeat(80));
  const level2c = compareKeys(refInv.intermediate_data, cmpInv.intermediate_data, 'intermediate_data', 0);
  
  // Special check: should be empty
  const refKeys = Object.keys(refInv.intermediate_data);
  const cmpKeys = Object.keys(cmpInv.intermediate_data);
  
  if (refKeys.length === 0 && cmpKeys.length === 0) {
    console.log('  ✅ CORRECT: Both are empty objects {}');
    console.log('');
  } else if (cmpKeys.length > 0) {
    console.log('  ⚠️  WARNING: Compare has properties (should be empty)');
    console.log('');
  }
}

// Value comparisons
console.log('🔍 VALUE CHECKS');
console.log('─'.repeat(80));

// Check invocation_id format
console.log('📍 invocation_id:');
console.log(`  Reference: "${refInv.invocation_id}"`);
console.log(`  Compare:   "${cmpInv.invocation_id}"`);
if (refInv.invocation_id.startsWith('e-') && cmpInv.invocation_id.startsWith('e-')) {
  console.log('  ✅ Both start with "e-" prefix');
} else {
  console.log('  ⚠️  Format mismatch');
}
console.log('');

// Check roles
console.log('📍 user_content.role:');
console.log(`  Reference: "${refInv.user_content.role}"`);
console.log(`  Compare:   "${cmpInv.user_content.role}"`);
console.log(`  ${refInv.user_content.role === cmpInv.user_content.role ? '✅ Match' : '❌ Mismatch'}`);
console.log('');

console.log('📍 final_response.role:');
console.log(`  Reference: "${refInv.final_response.role}"`);
console.log(`  Compare:   "${cmpInv.final_response.role}"`);
console.log(`  ${refInv.final_response.role === cmpInv.final_response.role ? '✅ Match' : '❌ Mismatch'}`);
console.log('');

// Check creation_timestamp type
console.log('📍 creation_timestamp:');
console.log(`  Reference: ${refInv.creation_timestamp} (${typeof refInv.creation_timestamp})`);
console.log(`  Compare:   ${cmpInv.creation_timestamp} (${typeof cmpInv.creation_timestamp})`);
console.log(`  ${typeof refInv.creation_timestamp === typeof cmpInv.creation_timestamp ? '✅ Type match' : '❌ Type mismatch'}`);
console.log('');

console.log('='.repeat(80));
console.log('COMPARISON COMPLETE');
console.log('='.repeat(80));

