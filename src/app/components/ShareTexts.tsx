import { CONTRACT_ADDRESS } from '../contractaddress';

interface SharePost {
    text: string;
}

const goodPosts: SharePost[] = [
    {
        text: `🎉🧧 OMG, I just got the Legendary Prize from $Hongbao! ✨💎\nThis is my luckiest day ever! Don't miss out!\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    },
    {
        text: `🧧💰 Luck from the Red Envelope! I just hit a legendary reward on $Hongbao! 🔥\nTry your luck now and join the fun!\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    },
    {
        text: `🔥✨ Can't believe it! The $Hongbao gacha blessed me with the Legendary Prize! 🧧🎊\nFeeling super lucky today!\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    }
];

const badPosts: SharePost[] = [
    {
        text: `💔🧧 Ugh, I just got the worst reward from $Hongbao... 😭\nMy luck must be on vacation. Someone send me some good vibes!\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    },
    {
        text: `😩💀 $Hongbao really humbled me today... Got the worst prize imaginable. 🧧💔\nMy luck is cursed—anyone wanna share theirs?\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    },
    {
        text: `🤡🧧 No way... I got trash from $Hongbao gacha!\nLuck was not on my side today. Gonna need a charm or something. 😅\n📜 Contract Address: ${CONTRACT_ADDRESS}`
    }
];

export const getRandomShareText = (isGood: boolean): string => {
    const posts = isGood ? goodPosts : badPosts;
    const randomIndex = Math.floor(Math.random() * posts.length);
    return posts[randomIndex].text;
};
