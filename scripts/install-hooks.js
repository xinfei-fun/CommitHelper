const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to detect project root directory
function getProjectRoot() {
    // 情况1：通过 npm postinstall 调用，使用 INIT_CWD 环境变量
    if (process.env.INIT_CWD) {
        return process.env.INIT_CWD;
    }
    
    // 情况2：回退到当前目录（可能是通过 CLI 命令调用）
    // 如果是通过 CLI 命令调用，当前目录就是项目根目录
    return process.cwd();
}

// Function to check if a directory is a git repository
function isGitRepository(dir) {
    try {
        const gitDir = path.join(dir, '.git');
        return fs.existsSync(gitDir) && fs.statSync(gitDir).isDirectory();
    } catch (error) {
        return false;
    }
}

// Function to install git hook
function installGitHook(hookName, hookScript) {
    const projectRoot = getProjectRoot();
    const hooksDir = path.join(projectRoot, '.git', 'hooks');
    const hookPath = path.join(hooksDir, hookName);
    
    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(hooksDir)) {
        fs.mkdirSync(hooksDir, { recursive: true });
    }
    
    // Write the hook script
    fs.writeFileSync(hookPath, hookScript);
    
    // Make the hook executable (Unix-like systems)
    if (process.platform !== 'win32') {
        try {
            execSync(`chmod +x ${hookPath}`);
        } catch (error) {
            console.warn(`Could not make hook executable: ${error.message}`);
        }
    }
    
    console.log(`✓ Installed ${hookName} hook`);
}

// Function to create default configuration file
function createDefaultConfig() {
    const projectRoot = getProjectRoot();
    const configPath = path.join(projectRoot, 'commit-helper.json');
    
    // Check if config file already exists
    if (fs.existsSync(configPath)) {
        console.log('✓ commit-helper.json already exists');
        return;
    }
    
    // Get the path to the default config file in the package
    const packageConfigPath = path.join(__dirname, '../commit-helper.json');
    
    // Check if the default config file exists in the package
    if (!fs.existsSync(packageConfigPath)) {
        console.log('⚠️  Default commit-helper.json not found in package');
        return;
    }
    
    try {
        // Read the default config from the package
        const defaultConfig = fs.readFileSync(packageConfigPath, 'utf8');
        
        // Write the default config file to current directory
        fs.writeFileSync(configPath, defaultConfig);
        console.log('✓ Created default commit-helper.json configuration file from package template');
    } catch (error) {
        console.error('❌ Failed to create default configuration:', error.message);
    }
}

// Main installation function
function installHooks() {
    console.log('Installing Git hooks for commit-helper...');
    
    // Create default configuration file
    createDefaultConfig();
    
    // Check if we're in a git repository
    const projectRoot = getProjectRoot();
    if (!isGitRepository(projectRoot)) {
        console.log('⚠️  Not in a git repository. Skipping hook installation.');
        return;
    }
    
    // Read the commit-msg hook script
    const hookScriptPath = path.join(__dirname, '../hooks/commit-msg.js');
    if (!fs.existsSync(hookScriptPath)) {
        console.error('❌ commit-msg hook script not found:', hookScriptPath);
        return;
    }
    
    const hookScript = fs.readFileSync(hookScriptPath, 'utf8');
    
    // Install the commit-msg hook
    installGitHook('commit-msg', hookScript);
    
    console.log('✅ Git hooks installed successfully!');
    console.log('The commit-helper will now intercept git commit messages.');
}

// Run installation
try {
    installHooks();
} catch (error) {
    console.error('❌ Failed to install Git hooks:', error.message);
    process.exit(1);
}
