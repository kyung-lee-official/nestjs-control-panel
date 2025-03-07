# YouTube Data API Response Examples

## Search

```
https://www.googleapis.com/youtube/v3/search?key=AIzaSyDv1_AWBZXH-EduSyxOi5YFpkUGgpHRnIk&q=3d%20print&part=id,snippet&type=video&maxResults=50&publishedAfter=2025-02-28T16%3A00%3A00.000Z&publishedBefore=2025-03-31T15%3A59%3A59.999Z
```

```json
{
	"kind": "youtube#searchListResponse",
	"etag": "JCilgNIOCrL9AblDVVBju5QxwiE",
	"nextPageToken": "CAUQAA",
	"regionCode": "US",
	"pageInfo": {
		"totalResults": 1000000,
		"resultsPerPage": 5
	},
	"items": [
		{
			"kind": "youtube#searchResult",
			"etag": "51r7vsRJN7F4nB47Rc-5VlVYpHo",
			"id": {
				"kind": "youtube#video",
				"videoId": "7-hg1N3RvbQ"
			},
			"snippet": {
				"publishedAt": "2024-04-26T10:54:33Z",
				"channelId": "UCxQbYGpbdrh-b2ND-AfIybg",
				"title": "Things to 3D print when you&#39;re bored!",
				"description": "Links: Best free cad software - https://youtu.be/J--QVhGheP4?si=HAulcCTHA8sW7s5Z Gridfinity - https://youtu.be/ra_9zU-mnl8 SD ...",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/hqdefault.jpg",
						"width": 480,
						"height": 360
					}
				},
				"channelTitle": "Maker's Muse",
				"liveBroadcastContent": "none",
				"publishTime": "2024-04-26T10:54:33Z"
			}
		},
		{
			"kind": "youtube#searchResult",
			"etag": "dhLdqEnTplbkgKxlu5ZKjR_yAUQ",
			"id": {
				"kind": "youtube#video",
				"videoId": "Coq9JJdUdqU"
			},
			"snippet": {
				"publishedAt": "2024-10-29T14:00:10Z",
				"channelId": "UCB5Nin2VBUeNLqamqEVh-2A",
				"title": "I Hand-Picked the BEST 3D Prints",
				"description": "In this video, we look at MORE Useful 3D Prints, and see if they're worth printing! Special thanks to our sponsor, FLSUN. Be sure ...",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/Coq9JJdUdqU/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/Coq9JJdUdqU/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/Coq9JJdUdqU/hqdefault.jpg",
						"width": 480,
						"height": 360
					}
				},
				"channelTitle": "The Next Layer",
				"liveBroadcastContent": "none",
				"publishTime": "2024-10-29T14:00:10Z"
			}
		},
		{
			"kind": "youtube#searchResult",
			"etag": "jb0GOpwbblmdmTCxHeRgtmaLo_4",
			"id": {
				"kind": "youtube#video",
				"videoId": "2vFdwz4U1VQ"
			},
			"snippet": {
				"publishedAt": "2023-05-06T15:04:25Z",
				"channelId": "UCuwjhSZ1dUKIOO8ZnqYrP1g",
				"title": "3D PRINTING 101: The ULTIMATE Beginner’s Guide",
				"description": "Getting started with 3D Printing doesn't have to be difficult. In this 3D Printing 101 course, we'll walk you through every step of ...",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/2vFdwz4U1VQ/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/2vFdwz4U1VQ/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/2vFdwz4U1VQ/hqdefault.jpg",
						"width": 480,
						"height": 360
					}
				},
				"channelTitle": "The 3D Printing Zone",
				"liveBroadcastContent": "none",
				"publishTime": "2023-05-06T15:04:25Z"
			}
		},
		{
			"kind": "youtube#searchResult",
			"etag": "cVG6NvTBCZLhT5yeoMbfyrur5Bk",
			"id": {
				"kind": "youtube#video",
				"videoId": "m12bX1eEVDM"
			},
			"snippet": {
				"publishedAt": "2023-01-08T15:38:55Z",
				"channelId": "UC1Ak7Ir1WMOWauY_oH00-Qg",
				"title": "Beginners Guide To 3D Printers In 2023",
				"description": "In this beginners guide to 3D Printers we talk about what you need to expect while getting started with 3D Printers in 2023! This is ...",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/m12bX1eEVDM/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/m12bX1eEVDM/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/m12bX1eEVDM/hqdefault.jpg",
						"width": 480,
						"height": 360
					}
				},
				"channelTitle": "The Edge of Tech",
				"liveBroadcastContent": "none",
				"publishTime": "2023-01-08T15:38:55Z"
			}
		},
		{
			"kind": "youtube#searchResult",
			"etag": "YM9kD815vbujmnygvt4851ZCdLY",
			"id": {
				"kind": "youtube#video",
				"videoId": "D_pEmQrF7V0"
			},
			"snippet": {
				"publishedAt": "2022-10-05T23:46:14Z",
				"channelId": "UCB5Nin2VBUeNLqamqEVh-2A",
				"title": "50+ Useful 3D Prints You Never Knew You Could Print",
				"description": "So you've got a 3D printer, and the first thing you ask yourself is: What should I print now? For sure, you'll go through your printer ...",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/D_pEmQrF7V0/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/D_pEmQrF7V0/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/D_pEmQrF7V0/hqdefault.jpg",
						"width": 480,
						"height": 360
					}
				},
				"channelTitle": "The Next Layer",
				"liveBroadcastContent": "none",
				"publishTime": "2022-10-05T23:46:14Z"
			}
		}
	]
}
```

## Channel

```json
{
	"kind": "youtube#channelListResponse",
	"etag": "0-DD7tSg0mVD74e0VIhTwtv_y3w",
	"pageInfo": {
		"totalResults": 1,
		"resultsPerPage": 5
	},
	"items": [
		{
			"kind": "youtube#channel",
			"etag": "0HsMNCzZ-D_-4VFR8lwCUJRt918",
			"id": "UCxQbYGpbdrh-b2ND-AfIybg",
			"snippet": {
				"title": "Maker's Muse",
				"description": "On Maker's Muse we aim to Empower Creativity through Technology.\n\n3D Design and Printing Tutorials, Reviews and Projects.\n\nJoin the Maker's Muse Community -  https://www.makersmuse.com/maker-s-muse-community\n\n3D Printing Quick Start Guide - https://www.makersmuse.com/fdm-fff-3d-printing-quick-start-guide\n\n3D Printer Buyers Guide - https://www.makersmuse.com/purchasing-your-first-3d-printer-fdm-fff\n\n3D Printing Essentials - https://www.amazon.com/shop/makersmuse\n\n3D Printing Models - https://www.makersmuse.com/store\n\nRecommended 3D Printers - https://www.makersmuse.com/3dprinters\n\nReview status: CLOSED - NOT ACCEPTING NEW REVIEWS AT THIS TIME\nPromotion status: Contact us below for content sponsorship opportunities\n",
				"customUrl": "@makersmuse",
				"publishedAt": "2013-12-30T04:18:35Z",
				"thumbnails": {
					"default": {
						"url": "https://yt3.ggpht.com/ytc/AIdro_kmQ8LEMA74i3vrUn2JajOz5NQ2yTK9zREX9eNOpGtf8nY=s88-c-k-c0x00ffffff-no-rj",
						"width": 88,
						"height": 88
					},
					"medium": {
						"url": "https://yt3.ggpht.com/ytc/AIdro_kmQ8LEMA74i3vrUn2JajOz5NQ2yTK9zREX9eNOpGtf8nY=s240-c-k-c0x00ffffff-no-rj",
						"width": 240,
						"height": 240
					},
					"high": {
						"url": "https://yt3.ggpht.com/ytc/AIdro_kmQ8LEMA74i3vrUn2JajOz5NQ2yTK9zREX9eNOpGtf8nY=s800-c-k-c0x00ffffff-no-rj",
						"width": 800,
						"height": 800
					}
				},
				"localized": {
					"title": "Maker's Muse",
					"description": "On Maker's Muse we aim to Empower Creativity through Technology.\n\n3D Design and Printing Tutorials, Reviews and Projects.\n\nJoin the Maker's Muse Community -  https://www.makersmuse.com/maker-s-muse-community\n\n3D Printing Quick Start Guide - https://www.makersmuse.com/fdm-fff-3d-printing-quick-start-guide\n\n3D Printer Buyers Guide - https://www.makersmuse.com/purchasing-your-first-3d-printer-fdm-fff\n\n3D Printing Essentials - https://www.amazon.com/shop/makersmuse\n\n3D Printing Models - https://www.makersmuse.com/store\n\nRecommended 3D Printers - https://www.makersmuse.com/3dprinters\n\nReview status: CLOSED - NOT ACCEPTING NEW REVIEWS AT THIS TIME\nPromotion status: Contact us below for content sponsorship opportunities\n"
				},
				"country": "AU"
			},
			"statistics": {
				"viewCount": "204833563",
				"subscriberCount": "1140000",
				"hiddenSubscriberCount": false,
				"videoCount": "697"
			}
		}
	]
}
```

## Video

```json
{
	"kind": "youtube#videoListResponse",
	"etag": "cJJnutwSmIjpJgoxlmyWW6umobo",
	"items": [
		{
			"kind": "youtube#video",
			"etag": "8iXi4928xADQh8Fv-7yE32lw6GI",
			"id": "7-hg1N3RvbQ",
			"snippet": {
				"publishedAt": "2024-04-26T10:54:33Z",
				"channelId": "UCxQbYGpbdrh-b2ND-AfIybg",
				"title": "Things to 3D print when you're bored!",
				"description": "Links:\nBest free cad software - https://youtu.be/J--QVhGheP4?si=HAulcCTHA8sW7s5Z\nGridfinity - https://youtu.be/ra_9zU-mnl8\nSD card desk organiser - https://www.makersmuse.com/sd-card-desk-organiser\nMini desktop escalator - https://www.printables.com/model/165271-mini-desktop-escalator\nExpanding lock box - https://www.makersmuse.com/expanding-lock-box\nKnucklebones game - https://www.makersmuse.com/knucklebones-3d-printed-dice-game-from-cult-of-the-lamb\n\nJoin the Maker's Muse Community -  https://www.makersmuse.com/maker-s-muse-community\n\n3D Printing Quick Start Guide - https://www.makersmuse.com/fdm-fff-3d-printing-quick-start-guide\n\n3D Printer Buyers Guide - https://www.makersmuse.com/purchasing-your-first-3d-printer-fdm-fff\n\n3D Printing Essentials - https://www.amazon.com/shop/makersmuse",
				"thumbnails": {
					"default": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/default.jpg",
						"width": 120,
						"height": 90
					},
					"medium": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/mqdefault.jpg",
						"width": 320,
						"height": 180
					},
					"high": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/hqdefault.jpg",
						"width": 480,
						"height": 360
					},
					"standard": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/sddefault.jpg",
						"width": 640,
						"height": 480
					},
					"maxres": {
						"url": "https://i.ytimg.com/vi/7-hg1N3RvbQ/maxresdefault.jpg",
						"width": 1280,
						"height": 720
					}
				},
				"channelTitle": "Maker's Muse",
				"tags": ["3d", "printing"],
				"categoryId": "28",
				"liveBroadcastContent": "none",
				"localized": {
					"title": "Things to 3D print when you're bored!",
					"description": "Links:\nBest free cad software - https://youtu.be/J--QVhGheP4?si=HAulcCTHA8sW7s5Z\nGridfinity - https://youtu.be/ra_9zU-mnl8\nSD card desk organiser - https://www.makersmuse.com/sd-card-desk-organiser\nMini desktop escalator - https://www.printables.com/model/165271-mini-desktop-escalator\nExpanding lock box - https://www.makersmuse.com/expanding-lock-box\nKnucklebones game - https://www.makersmuse.com/knucklebones-3d-printed-dice-game-from-cult-of-the-lamb\n\nJoin the Maker's Muse Community -  https://www.makersmuse.com/maker-s-muse-community\n\n3D Printing Quick Start Guide - https://www.makersmuse.com/fdm-fff-3d-printing-quick-start-guide\n\n3D Printer Buyers Guide - https://www.makersmuse.com/purchasing-your-first-3d-printer-fdm-fff\n\n3D Printing Essentials - https://www.amazon.com/shop/makersmuse"
				},
				"defaultAudioLanguage": "en"
			},
			"contentDetails": {
				"duration": "PT5M28S",
				"dimension": "2d",
				"definition": "hd",
				"caption": "false",
				"licensedContent": true,
				"contentRating": {},
				"projection": "rectangular"
			},
			"status": {
				"uploadStatus": "processed",
				"privacyStatus": "public",
				"license": "youtube",
				"embeddable": true,
				"publicStatsViewable": true,
				"madeForKids": false
			},
			"statistics": {
				"viewCount": "578093",
				"likeCount": "12517",
				"favoriteCount": "0",
				"commentCount": "301"
			}
		}
	],
	"pageInfo": {
		"totalResults": 1,
		"resultsPerPage": 1
	}
}
```

## Error Messages

### Token Expired

```json
{
	"error": {
		"code": 400,
		"message": "API key expired. Please renew the API key.",
		"errors": [
			{
				"message": "API key expired. Please renew the API key.",
				"domain": "global",
				"reason": "badRequest"
			}
		],
		"status": "INVALID_ARGUMENT",
		"details": [
			{
				"@type": "type.googleapis.com/google.rpc.ErrorInfo",
				"reason": "API_KEY_INVALID",
				"domain": "googleapis.com",
				"metadata": {
					"service": "youtube.googleapis.com"
				}
			},
			{
				"@type": "type.googleapis.com/google.rpc.LocalizedMessage",
				"locale": "en-US",
				"message": "API key expired. Please renew the API key."
			}
		]
	}
}
```
