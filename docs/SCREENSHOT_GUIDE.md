# Screenshot Guide for AlgoSmartForge

This guide explains what screenshots you need to capture for the hackathon submission.

## Required Screenshots

Save all screenshots in the `docs/images/` directory with the filenames specified below.

### 1. `banner.png`
**Content:** AlgoSmartForge logo/banner
- Can be created using design tools like Figma, Canva, or Photoshop
- Recommended size: 1200x400px
- Should feature the AlgoSmartForge name with purple gradient theme

### 2. `video-thumbnail.png`
**Content:** Thumbnail for the demo video
- Recommended size: 1280x720px
- Should be eye-catching and represent the project
- Include text: "AlgoSmartForge Demo"

### 3. `screenshot-home.png`
**What to capture:**
- Navigate to http://localhost:4200
- Capture the full home page showing:
  - Purple gradient hero section with "AlgoSmartForge" title
  - Animated gradient text
  - Stats cards (3 Agents, 5s Generation, 99% Success)
  - Features section
  - Example contracts gallery
  - CTA section at bottom
- Use full-page screenshot tool

### 4. `screenshot-generate.png`
**What to capture:**
- Navigate to http://localhost:4200/generate
- Show the contract generation page with:
  - Header with wallet connect button
  - Prompt input field
  - Example prompt text entered (e.g., "Create a counter contract with increment and decrement")
  - Generate button
- Full page screenshot

### 5. `screenshot-wallet.png`
**What to capture:**
- Click "Connect Wallet" button on any page
- Capture the wallet selection modal showing:
  - Modal header "Select wallet provider"
  - List of available wallets (Pera, Defly, Exodus)
  - Wallet icons and names
  - Close/Cancel buttons
- Modal should be centered and visible

### 6. `screenshot-payment.png`
**What to capture:**
- After connecting wallet and entering a prompt
- Capture the payment modal showing:
  - Payment amount (0.5 ALGO)
  - Receiver address
  - Confirm/Cancel buttons
  - Payment status/progress
- Modal should be centered and visible

### 7. `screenshot-result.png`
**What to capture:**
- After successful contract deployment
- Show task status component displaying:
  - Success message
  - Deployed App ID
  - Transaction ID
  - Contract code snippet
  - View on Explorer button
  - Download code button
- Full component/page screenshot

### 8. `screenshot-explorer.png`
**What to capture:**
- Open the Lora Explorer link for a deployed contract
- Navigate to: https://lora.algokit.io/localnet/application/[APP_ID]
- Capture the block explorer page showing:
  - Application details
  - Transaction history
  - Contract state
  - ABI methods
- Full page screenshot

## How to Take Screenshots

### Windows
- **Full Screen:** Press `Win + PrtScn` (saves to Pictures/Screenshots)
- **Snipping Tool:** Press `Win + Shift + S` for custom selection
- **Browser Full Page:** Use browser extension like "GoFullPage"

### Mac
- **Full Screen:** Press `Cmd + Shift + 3`
- **Selection:** Press `Cmd + Shift + 4`
- **Browser Full Page:** Use browser extension like "Full Page Screen Capture"

### Linux
- **Screenshot Tool:** Use `gnome-screenshot` or `flameshot`
- **Browser Full Page:** Use browser extensions

## Testing Before Screenshots

Before taking screenshots, ensure:

1. **Backend is running:**
   ```bash
   docker-compose up -d backend agent-runner
   ```

2. **Frontend is running:**
   ```bash
   cd frontend/algorand-ai-agent
   npm install
   npm start
   ```

3. **LocalNet is running:**
   ```bash
   algokit localnet start
   ```

4. **Test wallet connection:**
   - Have Pera Wallet or Defly Wallet browser extension installed
   - Configure for LocalNet
   - Fund account with LocalNet dispenser

5. **Generate a test contract:**
   - Connect wallet
   - Enter prompt: "Create a simple counter contract"
   - Complete payment
   - Wait for deployment to finish
   - Get App ID from results

## After Capturing Screenshots

1. Save all files to `docs/images/` with exact filenames above
2. Verify all images are clear and readable
3. Compress images if larger than 5MB each
4. Commit images to git:
   ```bash
   git add docs/images/
   git commit -m "Add hackathon screenshots"
   ```

## Recommended Screenshot Sizes

- Banner: 1200x400px (2:1 ratio)
- Video Thumbnail: 1280x720px (16:9 ratio)
- Page Screenshots: Full height, minimum 1280px width
- Modal Screenshots: Minimum 800x600px showing full modal
- Explorer Screenshot: Full page, minimum 1280px width

## Alternative: Use Placeholder Images

If you need to submit before taking real screenshots, you can use placeholder images from:
- https://placehold.co/1200x400/667eea/ffffff?text=AlgoSmartForge
- https://via.placeholder.com/1280x720.png?text=Demo+Video

Replace them with real screenshots as soon as possible!
