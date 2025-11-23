#!/usr/bin/env node

/**
 * Deep Structure Comparison Script
 * Recursively compares two JSON structures and reports ALL differences
 */

const fs = require('fs');
const path = require('path');

// Read the two files
const referencePath = path.join(__dirname, 'reference_docs', 'eval-reference-evalset.json');
const comparePath = path.join(__dirname, 'reference_docs', 'compare.evalset.json');

const reference = JSON.parse(fs.readFileSync(referencePath, 'utf-8'));
const compare = JSON.parse(fs.readFileSync(comparePath, 'utf-8'));

console.log('='.repeat(80));
console.log('DEEP STRUCTURE COMPARISON: ALL LAYERS');
console.log('='.repeat(80));
console.log('');

const issues = [];

/**
 * Get type of value
 */
function getType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * Deep comparison with path tracking
 */
function deepCompare(ref, cmp, path = 'root', level = 0) {
  const indent = '  '.repeat(level);
  
  const refType = getType(ref);
  const cmpType = getType(cmp);
  
  // Type mismatch
  if (refType !== cmpType) {
    const issue = `${path}: TYPE MISMATCH - reference is ${refType}, compare is ${cmpType}`;
    issues.push(issue);
    console.log(`${indent}❌ ${issue}`);
    return;
  }
  
  // If both are objects, compare keys
  if (refType === 'object' && ref !== null && cmp !== null) {
    const refKeys = Object.keys(ref).sort();
    const cmpKeys = Object.keys(cmp).sort();
    
    const onlyInRef = refKeys.filter(k => !cmpKeys.includes(k));
    const onlyInCmp = cmpKeys.filter(k => !refKeys.includes(k));
    const common = refKeys.filter(k => cmpKeys.includes(k));
    
    if (onlyInRef.length > 0 || onlyInCmp.length > 0) {
      console.log(`${indent}📍 ${path}`);
      
      if (onlyInRef.length > 0) {
        onlyInRef.forEach(key => {
          const issue = `${path}.${key}: MISSING in compare (type: ${getType(ref[key])})`;
          issues.push(issue);
          console.log(`${indent}  ❌ MISSING: "${key}" (${getType(ref[key])})`);
        });
      }
      
      if (onlyInCmp.length > 0) {
        onlyInCmp.forEach(key => {
          const issue = `${path}.${key}: EXTRA in compare (type: ${getType(cmp[key])})`;
          issues.push(issue);
          console.log(`${indent}  ⚠️  EXTRA: "${key}" (${getType(cmp[key])})`);
        });
      }
      
      console.log('');
    }
    
    // Recurse into common keys
    for (const key of common) {
      deepCompare(ref[key], cmp[key], `${path}.${key}`, level + 1);
    }
  }
  
  // If both are arrays, compare elements
  if (refType === 'array' && ref !== null && cmp !== null) {
    if (ref.length !== cmp.length) {
      const issue = `${path}: ARRAY LENGTH - reference has ${ref.length}, compare has ${cmp.length}`;
      issues.push(issue);
      console.log(`${indent}⚠️  ${path}: Array length differs (${ref.length} vs ${cmp.length})`);
      console.log('');
    }
    
    // Compare first element structure (if both arrays have elements)
    if (ref.length > 0 && cmp.length > 0) {
      deepCompare(ref[0], cmp[0], `${path}[0]`, level);
    }
  }
}

// Start comparison
deepCompare(reference, compare);

// Summary
console.log('='.repeat(80));
console.log(`SUMMARY: ${issues.length} ISSUE(S) FOUND`);
console.log('='.repeat(80));

if (issues.length > 0) {
  console.log('');
  console.log('ISSUE LIST:');
  issues.forEach((issue, i) => {
    console.log(`  ${i + 1}. ${issue}`);
  });
}

console.log('');
console.log('='.repeat(80));

