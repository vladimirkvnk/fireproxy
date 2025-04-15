/**
 * Automated tests for Fireproxy extension
 */

// Import the modules to test
import { isValidDomain, normalizeDomain, extractDomainFromUrl } from '../background/domain-management.js';
import { generatePACScript } from '../background/pac-generator.js';

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting automated tests...');
  
  let passingTests = 0;
  let failingTests = 0;
  const testResults = [];
  
  // Run domain validation tests
  const domainValidationResult = testDomainValidation();
  testResults.push(domainValidationResult);
  passingTests += domainValidationResult.passing;
  failingTests += domainValidationResult.failing;
  
  // Run domain extraction tests
  const domainExtractionResult = testDomainExtraction();
  testResults.push(domainExtractionResult);
  passingTests += domainExtractionResult.passing;
  failingTests += domainExtractionResult.failing;
  
  // Run PAC generation tests
  const pacGenerationResult = testProxyConfigGeneration();
  testResults.push(pacGenerationResult);
  passingTests += pacGenerationResult.passing;
  failingTests += pacGenerationResult.failing;
  
  // Run domain normalization tests
  const domainNormalizationResult = testDomainNormalization();
  testResults.push(domainNormalizationResult);
  passingTests += domainNormalizationResult.passing;
  failingTests += domainNormalizationResult.failing;
  
  // Print summary
  console.log('\n--- Test Summary ---');
  for (const result of testResults) {
    console.log(`${result.name}: ${result.passing} passing, ${result.failing} failing`);
  }
  console.log(`\nTotal: ${passingTests} passing, ${failingTests} failing`);
  
  return { passingTests, failingTests, testResults };
}

/**
 * Test domain validation
 */
function testDomainValidation() {
  console.log('\nRunning domain validation tests...');
  let passing = 0;
  let failing = 0;
  
  const validDomains = [
    'example.com',
    'sub.example.co.uk',
    'xn--80aswg.xn--p1ai',  // IDN
    '192.168.1.1',           // IP address
    'localhost'
  ];
  
  const invalidDomains = [
    'not-a-domain',
    'example',
    '.com',
    'http://example.com',    // With protocol
    'example.com/path',      // With path
    'user@example.com'       // Email-like
  ];
  
  // Test valid domains
  for (const domain of validDomains) {
    const result = isValidDomain(domain);
    if (result === true) {
      passing++;
      console.log(`✓ Domain ${domain} correctly validated as valid`);
    } else {
      failing++;
      console.error(`✗ Domain ${domain} should be valid but was rejected`);
    }
  }
  
  // Test invalid domains
  for (const domain of invalidDomains) {
    const result = isValidDomain(domain);
    if (result === false) {
      passing++;
      console.log(`✓ Domain ${domain} correctly validated as invalid`);
    } else {
      failing++;
      console.error(`✗ Domain ${domain} should be invalid but was accepted`);
    }
  }
  
  return { name: 'Domain Validation', passing, failing };
}

/**
 * Test domain extraction
 */
function testDomainExtraction() {
  console.log('\nRunning domain extraction tests...');
  let passing = 0;
  let failing = 0;
  
  const testCases = [
    { url: 'https://example.com', expected: 'example.com' },
    { url: 'https://sub.example.com/path', expected: 'sub.example.com' },
    { url: 'http://example.com:8080', expected: 'example.com' },
    { url: 'https://user:pass@example.com', expected: 'example.com' }
  ];
  
  for (const testCase of testCases) {
    const result = extractDomainFromUrl(testCase.url);
    if (result === testCase.expected) {
      passing++;
      console.log(`✓ Correctly extracted ${testCase.expected} from ${testCase.url}`);
    } else {
      failing++;
      console.error(`✗ Expected ${testCase.url} to extract to ${testCase.expected}, but got ${result}`);
    }
  }
  
  return { name: 'Domain Extraction', passing, failing };
}

/**
 * Test proxy config generation
 */
function testProxyConfigGeneration() {
  console.log('\nRunning PAC script generation tests...');
  let passing = 0;
  let failing = 0;
  
  // Test 1: Basic PAC generation
  const domains = ['example.com', 'test.org'];
  const config = { host: '127.0.0.1', port: 8080, type: 'socks5' };
  
  const pacScript = generatePACScript(domains, config);
  
  if (pacScript.includes('SOCKS5 127.0.0.1:8080')) {
    passing++;
    console.log('✓ PAC script includes correct proxy string');
  } else {
    failing++;
    console.error('✗ PAC script missing correct proxy string');
  }
  
  if (pacScript.includes('example.com')) {
    passing++;
    console.log('✓ PAC script includes first domain');
  } else {
    failing++;
    console.error('✗ PAC script missing first domain');
  }
  
  if (pacScript.includes('test.org')) {
    passing++;
    console.log('✓ PAC script includes second domain');
  } else {
    failing++;
    console.error('✗ PAC script missing second domain');
  }
  
  // Test 2: Different proxy types
  const proxyTypes = [
    { type: 'socks5', expected: 'SOCKS5' },
    { type: 'socks4', expected: 'SOCKS' },
    { type: 'http', expected: 'PROXY' },
    { type: 'https', expected: 'HTTPS' }
  ];
  
  for (const proxyType of proxyTypes) {
    const config = { host: '127.0.0.1', port: 8080, type: proxyType.type };
    const pacScript = generatePACScript(domains, config);
    
    if (pacScript.includes(`${proxyType.expected} 127.0.0.1:8080`)) {
      passing++;
      console.log(`✓ PAC script includes correct ${proxyType.type} proxy string`);
    } else {
      failing++;
      console.error(`✗ PAC script missing correct ${proxyType.type} proxy string`);
    }
  }
  
  return { name: 'PAC Generation', passing, failing };
}

/**
 * Test domain normalization
 */
function testDomainNormalization() {
  console.log('\nRunning domain normalization tests...');
  let passing = 0;
  let failing = 0;
  
  const testCases = [
    { input: 'EXAMPLE.COM', expected: 'example.com' },
    { input: 'http://example.com', expected: 'example.com' },
    { input: 'https://example.com/path?query=123', expected: 'example.com' },
    { input: 'example.com:8080', expected: 'example.com' },
    { input: '.example.com', expected: 'example.com' },
    { input: 'sub.example.com', expected: 'sub.example.com' },
    { input: '  example.com  ', expected: 'example.com' }
  ];
  
  for (const testCase of testCases) {
    const result = normalizeDomain(testCase.input);
    if (result === testCase.expected) {
      passing++;
      console.log(`✓ Correctly normalized ${testCase.input} to ${testCase.expected}`);
    } else {
      failing++;
      console.error(`✗ Expected ${testCase.input} to normalize to ${testCase.expected}, but got ${result}`);
    }
  }
  
  return { name: 'Domain Normalization', passing, failing };
}

// Export the test functions
export {
  runAllTests,
  testDomainValidation,
  testDomainExtraction,
  testProxyConfigGeneration,
  testDomainNormalization
};