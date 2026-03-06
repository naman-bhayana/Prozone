## Prozone Desktop App – Setup & Usage

This project is a Windows desktop application (Electron) that reads data from Prozone PUC equipment over a serial (COM) port and exposes it via a local HTTP API.

The app supports:
- **Gas (Multi Gas Analyzer – Zone1)**
- **Smoke (Smoke Meter – Zone2)**

It also runs an Express server on `http://localhost:8585` to serve JSON data for integration with other software.

---

## 1. Requirements

- **OS**: Windows 10 or later
- **Node.js**: 18.x or 20.x (LTS recommended)
- **npm**: comes with Node.js
- **Hardware**:
  - Prozone gas and/or smoke analyzer
  - Serial/USB cable and installed driver (COM port visible in Device Manager)

---

## 2. First-Time Setup (developer / zipped source)

1. **Clone or unzip the repo**

   ```bash
   cd path\to\Prozone
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will:
   - Install Electron, Express, SerialPort, etc.
   - Run `electron-builder install-app-deps` (native modules for your platform).

---

## 3. Running the App in Development

From the project root:

```bash
npm start
```

This will:
- Start the Electron desktop window.
- Start the Express API server on **`http://localhost:8585`**.

### 3.1. Using the desktop UI

1. **Open the app window** (Prozone) – it appears after `npm start`.
2. In the top-left:
   - **Select Test Type**: choose **Gas** or **Smoke**.
   - **BaudRate**: default `9600` (change only if your machine is configured differently).
3. In the top-middle:
   - Click **Scan** to discover available COM ports.
   - Select the COM port that your machine is connected to (e.g. `COM3`, `COM4`).
4. Click **Connect**:
   - The app opens the serial port.
   - When the machine starts a measurement, the hex data is decoded.
   - The **Receive information** box shows:
     - For Gas: `CO`, `HC`, `CO2`, `O2`, `RPM`, `Lambda`.
     - For Smoke: `Flush_Cyl`, `Test1`, `Test2`, `Test3`, `Test_AVG`.
5. To stop:
   - Click **Disconnect**.
   - The UI resets to the initial state (empty console, cleared COM port list, test type back to default).

---

## 4. API Endpoints

While the app is running, the following endpoints are available:

- **Gas live data (Zone1)**  
  `GET http://localhost:8585/api/PROZONE/Zone1/`

- **Gas test data (Zone1_t)**  
  `GET http://localhost:8585/api/PROZONE/Zone1_t/`

- **Smoke live data (Zone2)**  
  `GET http://localhost:8585/api/PROZONE/Zone2/`

- **Smoke test data (Zone2_t)**  
  `GET http://localhost:8585/api/PROZONE/Zone2_t/`

Response format (example for Gas – Zone1):

```json
{
  "CO": "0.00",
  "HC": "0",
  "CO2": "0.000",
  "O2": "20.90",
  "RPM": "0",
  "Lambda_CO": "0.00",
  "Lambda": "1.000",
  "Date": "26-02-2026",
  "Time": "10:47",
  "Reserve": "8",
  "Status": "OK"
}
```

Notes:
- `PUC_Test` and `PUC_Test_End` fields are handled internally and stripped from API responses so they are easier to consume from the frontend.
- `Lambda` is normalized in the range **0.97–1.03** (step 0.01).

---

## 5. Building a Windows Installer (EXE)

To create a distributable installer (`.exe`) for end users:

```bash
npm run dist
```

This uses **electron-builder** and generates:

- **Installer**: `dist/prozone Setup 1.0.0.exe`
- **Unpacked app**: `dist/win-unpacked/` (portable folder with `prozone.exe`)

### 5.1. For testers / end users

You can send them one of:

- **Installer** – recommended  
  - File: `prozone Setup 1.0.0.exe`  
  - They double-click, follow the wizard, then run “Prozone” from the Start Menu/shortcut.

- **Portable folder** (no install)  
  - Zip `dist/win-unpacked/` and send it.  
  - They unzip and run `prozone.exe`.

The API and behavior are the same in both cases.

---

## 6. Common Issues / Tips

- **No COM ports in dropdown**  
  - Check that the USB/serial driver is installed and the device is visible in Device Manager.
  - Click **Scan** after (re)connecting the cable.

- **Smoke data not updating but Gas works**  
  - Make sure **Select Test Type = Smoke**, correct COM port, and that the smoke test is actually running on the machine.  
  - The app expects complete 53-byte smoke packets; partial data is ignored.

- **API returns only test data**  
  - Before live data is received, the app initializes `gas.json` and `smoke.json` from `gas_test.json` and `smoke_test.json`.  
  - Once live data arrives for Gas or Smoke, the corresponding JSON file is overwritten with the new values.

---

## 7. Development Notes

- Main Electron process: `public/js/main.js`
- Renderer / serial logic and parsing: `public/js/myjs.js`
- API server: `public/js/server.js`
- Styles: `public/css/index.css`

You can modify the parsing logic, UI styling, or API responses by editing these files and re-running `npm start` or rebuilding the installer.
