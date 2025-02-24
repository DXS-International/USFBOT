const { 
  EmbedBuilder, 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ComponentType } = require('discord.js');
const axios = require('axios');
const SerpApi = require('google-search-results-nodejs');
const { GOOGLE_API_KEY, GOOGLE_CSE_ID, SERPAPI_KEY } = require('../../config.json');

const search = new SerpApi.GoogleSearch(SERPAPI_KEY)

async function fetchGoogleResults(query) {
  const apiKey = GOOGLE_API_KEY;
  const cx = GOOGLE_CSE_ID;
  if (!apiKey || !cx) {
    console.error('Google API Key or CSE ID is missing.');
    return null;
  }
  try {
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1`, {
      params: { key: apiKey, cx: cx, q: query, num: 5 }
    });
    if (response.data.error) {
      console.error('Google API Error:', response.data.error.message);
      return null;
    }
    if (!response.data.items || response.data.items.length === 0) {
      console.log('No results found for query:', query);
      return null;
    }
    return response.data.items.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet
    }));
  } catch (error) {
    console.error('Google API Request Failed:', error.message);
    return null;
  }
}

async function fetchDuckDuckGoResults(query) {
  try {
    const response = await axios.get(`https://api.duckduckgo.com/`, {
      params: { q: query, format: 'json', no_html: 1, no_redirect: 1 }
    });
    const data = response.data;
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      return data.RelatedTopics
        .filter(rt => rt.FirstURL && rt.Text)
        .slice(0, 5)
        .map(rt => ({
          title: rt.Text,
          link: rt.FirstURL,
          snippet: rt.Text || ''
        }));
    }
    if (data.Results && data.Results.length > 0) {
      return data.Results
        .filter(result => result.FirstURL && result.Text)
        .slice(0, 5)
        .map(result => ({
          title: result.Text,
          link: result.FirstURL,
          snippet: result.Text || ''
        }));
    }
    return null;
  } catch (error) {
    console.error('DuckDuckGo API Error:', error.message);
    return null;
  }
}

async function fetchBingResults(query) {
  return new Promise((resolve, reject) => {
    search.json({
      engine: 'bing',
      q: query,
      count: 5
    }, (result) => {
      if (result?.error) {
        return reject(new Error(result.error));
      }
      if (result?.organic_results) {
        resolve(result.organic_results.slice(0, 5).map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        })));
      } else {
        resolve(null);
      }
    });
  });
}

async function fetchYahooResults(query) {
  return new Promise((resolve, reject) => {
    search.json({
      engine: 'yahoo',
      p: query,
      count: 5
    }, (result) => {
      if (result?.error) {
        return reject(new Error(result.error));
      }
      if (result?.organic_results) {
        resolve(result.organic_results.slice(0, 5).map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        })));
      } else {
        resolve(null);
      }
    });
  });
}

async function fetchYandexResults(query) {
  return new Promise((resolve, reject) => {
    search.json({
      engine: 'yandex',
      text: query,
      num: 5
    }, (result) => {
      if (result?.error) {
        return reject(new Error(result.error));
      }
      if (result?.organic_results) {
        resolve(result.organic_results.slice(0, 5).map(item => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet
        })));
      } else {
        resolve(null);
      }
    });
  });
}
//
module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search the web')
    .addStringOption(option => 
      option.setName('query')
        .setDescription('What to search for')
        .setRequired(true)
        .setMaxLength(100)
    )
    .setDMPermission(false),

  async execute(interaction) {
    await interaction.deferReply();
    const query = interaction.options.getString('query');
    const encodedQuery = encodeURIComponent(query);
    const engines = [
      {
        name: 'Google',
        url: `https://google.com/search?q=${encodedQuery}`,
        api: fetchGoogleResults,
        color: 0x4285F4,
        emoji: '<:google:1266016555662184606>',
        enabled: !!GOOGLE_API_KEY && !!GOOGLE_CSE_ID,
        preloaded: true
      },
      {
        name: 'DuckDuckGo',
        url: `https://duckduckgo.com/?q=${encodedQuery}`,
        api: fetchDuckDuckGoResults,
        color: 0xDE5833,
        emoji: '<:duckduckgo:1266021571508572261>',
        enabled: true,
        preloaded: true
      },
      {
        name: 'Bing',
        url: `https://bing.com/search?q=${encodedQuery}`,
        api: fetchBingResults,
        color: 0x00809D,
        emoji: '<:bing:1266020917314850907>',
        enabled: !!SERPAPI_KEY,
        preloaded: false
      },
      {
        name: 'Yandex',
        url: `https://yandex.com/search/?text=${encodedQuery}`,
        api: fetchYandexResults,
        color: 0xFF0000,
        emoji: '<:yandex:1266020634484539515>',
        enabled: !!SERPAPI_KEY,
        preloaded: false
      },
      {
        name: 'Yahoo',
        url: `https://search.yahoo.com/search?p=${encodedQuery}`,
        api: fetchYahooResults,
        color: 0x720E9E,
        emoji: '<:yahoo:1266019185100718155>',
        enabled: !!SERPAPI_KEY,
        preloaded: false
      },
      {
        name: 'Brave',
        url: `https://search.brave.com/search?q=${encodedQuery}`,
        color: 0xFF2000,
        emoji: '<:brave:1266017410109149287>',
        preloaded: true
      },
      {
        name: 'Ecosia',
        url: `https://www.ecosia.org/search?q=${encodedQuery}`,
        color: 0x4CAF50,
        emoji: '<:ecosia:1266017707766055045>',
        preloaded: true
      },
      {
        name: 'Qwant',
        url: `https://www.qwant.com/?q=${encodedQuery}`,
        color: 0x3DA4F7,
        emoji: '<:qwant:1266021495981998172>',
        preloaded: true
      },
      { 
        name: 'Swisscows',
        url: `https://swisscows.com/it/web?query=${encodedQuery}`,
        color: 0x3DA4F7,
        emoji: '<:swisscows:1266020983651958785>',
        preloaded: true
      },
      {
        name: 'Gibiru',
        url: `https://gibiru.com/results.html?q=${encodedQuery}`,
        color: 0x3DA4F7,
        emoji: '<:gibiru:1266020402749247581>',
        preloaded: true
      },
      {
        name: 'Lilo',
        url: `https://search.lilo.org/?q=${encodedQuery}`,
        color: 0x3DA4F7,
        emoji: '<:lilo:1266019331301576754>',
        preloaded: true
      }
    ];

    const googleEngine = engines.find(engine => engine.name === 'Google');
    let googleResults = null;
    if (googleEngine && googleEngine.enabled && googleEngine.api) {
      try {
        googleResults = await googleEngine.api(query);
      } catch (error) {
        console.error(`Google API Error: ${error.message}`);
      }
    }

    const thumbnail = "https://images-ext-1.discordapp.net/external/h7VD-9eIhCVG_iXbz34XIIcV_y0YhRBOpwXKIMzXzLc/%3Fformat%3Dwebp%26width%3D1000%26height%3D1000/https/images-ext-1.discordapp.net/external/ko5VNLbcv3oQRjZ5nOrb32zMTs90Z8-EMQ2zDYtVGiA/%253Fformat%253Dwebp%2526width%253D1000%2526height%253D1000/https/images-ext-1.discordapp.net/external/bFQp5NiyMi6YMWpRoRXGtIxphADOtlSR6ZsYI9CYm8s/%25253Fsize%25253D2048/https/cdn.discordapp.com/icons/1238466262456340480/af28dbe35acf0961072a7c500d1faaeb.webp?format=webp&width=1000&height=1000";
    const googleEmbed = new EmbedBuilder()
      .setColor(googleEngine.color || 0x4285F4)
      .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setThumbnail(thumbnail)
      .setTimestamp()
      .setTitle(`${googleEngine.emoji} ${query}`);

    if (googleResults && googleResults.length > 0) {
      googleEmbed.setDescription(
        googleResults.map((r, i) =>
          `${i + 1}. [${r.title}](${r.link})\n${r.snippet ? `> ${r.snippet.slice(0, 150)}...` : ''}`
        ).join('\n\n')
      );
    } else {
      googleEmbed.setDescription(`No results found\n[Search for ${query} on ${googleEngine.emoji} ${googleEngine.name}](${googleEngine.url})`);
    }

    const pages = engines.map(engine => {
      let embed = new EmbedBuilder()
        .setColor(engine.color || 0x00FFFF)
        .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(thumbnail)
        .setTimestamp()
        .setTitle(`${engine.emoji} ${query}`);

      if (engine.name === 'Google') {
        embed = googleEmbed;
      } else if (!engine.api) {
        embed.setDescription(`[Open ${engine.emoji} ${engine.name} Search](${engine.url})`);
      } else {
        embed.setDescription(`Click to load results from ${engine.emoji} ${engine.name}:\n[${query}](${engine.url})`);
      }
      return {
        name: engine.name,
        engine,
        embed,
        url: engine.url,
        cachedEmbed: null
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('search_engine')
      .setPlaceholder('Choose search engine')
      .addOptions(pages.map((page, index) => ({
        label: page.name,
        value: index.toString(),
        description: `View ${page.name} results`,
        emoji: engines[index].emoji
      })));

    const actionRow = new ActionRowBuilder().addComponents(selectMenu);

    const initialResponse = await interaction.editReply({
      embeds: [googleEmbed],
      components: [actionRow]
    });

    const collector = initialResponse.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        await i.reply({ content: "This isn't your search.", flags: 64 });
        return;
      }
      const selectedIndex = parseInt(i.values[0]);
      const selectedPage = pages[selectedIndex];
      const engine = selectedPage.engine;

      await i.deferUpdate();

      if (engine.api && engine.name !== 'Google') {
        if (selectedPage.cachedEmbed) {
          await interaction.editReply({ embeds: [selectedPage.cachedEmbed] });
          return;
        }
        try {
          const loadingEmbed = new EmbedBuilder()
            .setColor(engine.color || 0x00FFFF)
            .setTitle(`${engine.emoji} ${query}`)
            .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(`[Search for ${query} on ${engine.emoji} ${engine.name}](${engine.url})`)
            .setThumbnail(thumbnail)
            .setTimestamp();
          await interaction.editReply({ embeds: [loadingEmbed] });

          const results = engine.enabled ? await engine.api(query) : null;

          let newEmbed = new EmbedBuilder()
            .setColor(engine.color || 0x00FFFF)
            .setAuthor({ name: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setThumbnail(thumbnail)
            .setTimestamp()
            .setTitle(`${engine.emoji} ${query}`);

          if (results && results.length > 0) {
            newEmbed.setDescription(
              results.map((r, i) =>
                `${i + 1}. [${r.title}](${r.link})\n${r.snippet ? `> ${r.snippet.slice(0, 150)}...` : ''}`
              ).join('\n\n')
            );
          } else {
            newEmbed.setDescription(`No results found\n[Search for ${query} on ${engine.emoji} ${engine.name}](${engine.url})`);
          }
          selectedPage.cachedEmbed = newEmbed;
          await interaction.editReply({ embeds: [newEmbed] });
        } catch (error) {
          console.error(`${engine.name} API Error:`, error.message);
          const errorEmbed = new EmbedBuilder()
            .setColor(engine.color || 0x00FFFF)
            .setTitle(`${engine.emoji} ${query}`)
            .setDescription(`[Search for ${query} on ${engine.emoji} ${engine.name}](${engine.url})`)
            .setTimestamp();
          await interaction.editReply({ embeds: [errorEmbed] });
        }
      } else {
        await interaction.editReply({ embeds: [selectedPage.embed] });
      }
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] });
      } catch (e) {
        console.error(e);
      }
    });
  }
};
