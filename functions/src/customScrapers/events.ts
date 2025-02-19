import * as cheerio from "cheerio";

export function luma(html: string) {
    const $ = cheerio.load(html);

    const scriptTagData = $(
        'script[data-cfasync="false"][type="application/ld+json"]'
    ).text();
    let data = JSON.parse(scriptTagData);

    return {
        data: {
            title: data.name,
            bannerUri:
                $('meta[property="og:image"]').attr("content") ??
                data.image[0] ??
                "",
            startTime: data.startDate,
            endTime: data.endDate,
            links: [data["@id"]],
            // schemaData: data,
        },
        promptOutputFormat: `
        {
            "description": string,
        }
        `,
    };
}

export function meetup(html: string) {
    const $ = cheerio.load(html);

    let data: { [key: string]: any } = {};
    $('script[type="application/ld+json"]')
        .toArray()
        .some((elem) => {
            data = JSON.parse($(elem).text());
            return data["@type"] === "Event";
        });

    return {
        data: {
            title: data.name,
            bannerUri: data.image[0] ?? "",
            startTime: data.startDate,
            endTime: data.endDate,
            links: [data.url],
            // schemaData: data,
        },
        promptOutputFormat: `
        {
            "description": string,
        }
        `,
    };
}
