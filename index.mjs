import axios from "axios";
import { TwitterApi } from "twitter-api-v2";
import * as dotenv from "dotenv";

const COINGECKO_API_URL = "https://api.coingecko.com/api/v3";
const CURRENCY = "usd";
const COIN_ID = "bitcoin";

dotenv.config();

const twitterClient = new TwitterApi({
  appKey: process.env.APP_KEY,
  appSecret: process.env.APP_SECRET,
  accessToken: process.env.ACCESS_TOKEN,
  accessSecret: process.env.ACCESS_SECRET,
});

async function postTweet() {
  try {
    const message = await getPriceData();
    const tweet = await twitterClient.v2.tweet({ text: message });
    console.log(`Successfully posted tweet: ${JSON.stringify(tweet.data, null, 2)}`);
  } catch (error) {
    console.error(error);
  }
}

const getPriceData = async () => {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/coins/${COIN_ID}/market_chart`, {
      params: {
        vs_currency: CURRENCY,
        days: 1,
      },
    });
    const data = response.data;

    const currentPrice = data.prices.slice(-1)[0][1];
    const priceChange1h = (((currentPrice - data.prices[data.prices.length - 13][1]) / currentPrice) * 100).toFixed(2);
    const priceChange24h = (((currentPrice - data.prices[0][1]) / data.prices[0][1]) * 100).toFixed(2);
    const marketCap = data.market_caps.slice(-1)[0][1];
    const marketCapChange24h = (((marketCap - data.market_caps[0][1]) / data.market_caps[0][1]) * 100).toFixed(2);
    const totalVolume = data.total_volumes.slice(-1)[0][1];
    const totalVolumeChange24h = (((totalVolume - data.total_volumes[0][1]) / data.total_volumes[0][1]) * 100).toFixed(2);

    const message1 = `🚀 #Bitcoin is currently trading at:\n💰 $${currentPrice.toLocaleString("en-US")} (${
      priceChange1h > 0 ? `+${priceChange1h}` : priceChange1h
    }% in the last 1 hour)\n\n`;
    const message2 = `📈 24h change:\n${priceChange24h > 0 ? `+${priceChange24h}` : priceChange24h}% ${priceChange24h > 0 ? "↑" : "↓"}\n\n`;
    const message3 = `💵 Market cap:\n$${marketCap.toLocaleString("en-US")} (${
      marketCapChange24h > 0 ? `+${marketCapChange24h}` : marketCapChange24h
    }% in the last 24 hours) \n\n`;
    const message4 = `📊 24h volume:\n$${totalVolume.toLocaleString("en-US")} (${
      totalVolumeChange24h > 0 ? `+${totalVolumeChange24h}` : totalVolumeChange24h
    }% in the last 24 hours)`;

    const final_message = message1 + message2 + message3 + message4;

    return final_message;
  } catch (error) {
    console.error(error);
  }
};

postTweet();

// exports.handler = async function (event, context) {
//   return postTweet();
// };
