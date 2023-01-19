import cheerio from 'cheerio'
const $ = cheerio.load('<img src="image1.jpg" alt="image 1"> <img src="image2.jpg" alt="image 2">');

$('img').each(function () {
    if ($(this).attr('alt') !== undefined)
        console.log($(this).attr('alt'));
});
