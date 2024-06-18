import nodeHtmlToImage from 'node-html-to-image';
import QRCode from "qrcode";
import { Request, Response } from 'express'
import fs from 'fs';

export const generatePNLImage = async (req: Request, res: Response) => {
  try {
    const { chatId, pairTitle, boughtAmount, pnlValue, worth, profitPercent, burnAmount, isBuy, referralLink } = req.body;

    const timestamp = (Date.now() / 1000).toFixed(0);
    const imageId = `${chatId}-${timestamp}.png`

    const image = fs.readFileSync('./src/assets/pnlbg.png');
    const base64Image = Buffer.from(image).toString('base64');
    const dataURI = 'data:image/jpeg;base64,' + base64Image

    const fireImage = fs.readFileSync('./src/assets/fire.png');
    const fireBase64Image = Buffer.from(fireImage).toString('base64');
    const fireDataURI = 'data:image/jpeg;base64,' + fireBase64Image;

    const scanmeImage = fs.readFileSync('./src/assets/scanme.png');
    const scanmeBase64Image = Buffer.from(scanmeImage).toString('base64');
    const scanmeDataURI = 'data:image/jpeg;base64,' + scanmeBase64Image;

    const result = await QRCode.toDataURL(referralLink, {
      color: {
        dark: "#7ED957FF",
        light: "#FFBF6000"
      }
    });

    const HTMLCode = `
    <html>
      <style>
        body {
          padding: 0;
          margin: 0;
          width: 1458px;
          height: 820px;
          box-sizing: border-box;
          font-family: 'Poppins', sans-serif;
        }

        .container {
          position: relative;
          width: 1458px;
          height: 820px;
        }

        .pngbg {
          width: 1458px;
          height: 820px;
          position: absolute;
          z-index: 1;
        }
        .contents {
          position: absolute;
          z-index: 2;
          width: 100%;
          height: 100%;
        }
        .contents-block {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 100%;
          height: 100%;
        }

        .contents-body {
          display: flex;
          flex-direction: column;
          padding: 70px 80px;
        }

        .trade-buy {
          background-color: #7ED957;
          color: white;
          border-radius: 20px;
          width: 50px;
          text-align: center;
          font-size: 25px;
          font-weight: 600;
          padding: 2px 10px;
        }
        .trade-sell {
          background-color: #F1473A;
          color: white;
          border-radius: 20px;
          width: 50px;
          text-align: center;
          font-size: 25px;
          font-weight: 600;
          padding: 2px 10px;
        }

        .bonk-sol {
          color: #B647EE;
          font-size: 74px;
          font-weight: 600;
          margin: 10px 0;
        }

        .bought-pl-worth {
          color: #7D98D5;
          font-size: 30px;
          font-weight: 600;
          margin: 4px 0;
        }

        .text-red {
          color: #B647EE;
        }
        .percentage {
          color: ${profitPercent < 0 ? '#F1473A' : '#7ED957'};
          font-size: 150px;
          font-weight: 600;
          width: 100%;
          text-align: center;
          margin: 40px 0;
        }
        .burn {
          width: 100%;
          display: flex;
          flex-direction: row;
          align-items: start;
          gap: 4px;
          justify-content: center;
          margin: 20px 0;
        }
        .firepng {
          width: 25px;
          height: 30px;
        }
        .burnedBox {
          font-size: 30px;
          font-weight: 600;
        }
        .burnedText {
          color: #7D98D5;
        }
        .burnedValue {
          color: #F1473A;
        }
        .contents-footer {
          width: 100%;
          background-color: #B647EE;
          color: white;
          font-weight: 600;
          font-size: 29px;
          height: 100px;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
        }
        .description {
          max-width: 800px;
          text-align: center;
        }
        .scanme {
          position: absolute;
          right: 10px;
        }
        .scanmebody {
          position: relative;
        }
        .qrcode {
          position: absolute;
          right: -5px;
          top: -5px;
        }
      </style>
      <body>
        <div class="container">
          <img src="{{imageSource}}" class="pngbg"/>
          <div class="contents">
            <div class="contents-block">
              <div class="contents-body">
                ${isBuy ? '<div class="trade-buy">Buy</div>' : '<div class="trade-sell">Sell</div>'}
                <div class="bonk-sol">${pairTitle}</div>
                <div class="bought-pl-worth">
                  Bought: <span class="text-red">${boughtAmount ?? "0"} SOL</span>
                </div>
                <div class="bought-pl-worth">
                  P&amp;L: <span class="text-red">${pnlValue ?? ""}</span>
                </div>
                <div class="bought-pl-worth">
                  Worth: <span class="text-red">$${worth ?? "0"}</span>
                </div>
                <div class="percentage">${profitPercent}%</div>
                <div class="burn">
                  <img src="{{fireImageSource}}" class="firepng"/>
                  <div class="burnedBox">
                    <span class="burnedText">Burned: </span>
                    <span class="burnedValue">${burnAmount}</span>
                  </div>
                </div>
              </div>
              <div class="contents-footer">
                <span class="description">
                  GrowTrade is the only Trading Bot which lets you burn 
                  any token through its fee system
                </span>
                <div class="scanme">
                  <div class="scanmebody">
                    <img class="scanmetext" src="{{scanmeImageSource}}" height="80" />
                    <img class="qrcode" src="${result}" width="90" height="90" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `

    await nodeHtmlToImage({
      output: `./src/assets/pnl/${imageId}`,
      html: HTMLCode,
      quality: 100,
      content: {
        imageSource: dataURI,
        fireImageSource: fireDataURI,
        scanmeImageSource: scanmeDataURI
      },
      puppeteerArgs: { args: ['--no-sandbox'] }
    });
    // .then(() => console.log('The image was created successfully!'))
    res.status(200).send({
      pplUrl: `${req.protocol}://${req.get('host')}/assets/pnl/${imageId}`
    })
  } catch (e) {
    console.log(e);
    return res.status(500).send({ msg: "Internal server error" });
  }
}
