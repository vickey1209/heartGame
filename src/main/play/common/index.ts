import { CARD_SEQUENCE, NUMERICAL } from "../../../constants";
import { cardInfo, cardMoveRes } from "../../interface/responseIf";

export function formateCardsWithIndex(currentCards: string[], targetCards: string[]) {
    const cards: cardInfo[] = currentCards.reduce((result: cardInfo[], card: string, index: number) => {
        if (targetCards.includes(card)) {
            result.push({ card, index });
        }
        return result;
    }, []);

    return cards;
}

export async function findAndMoveCardsInLeftSide(array: string[][], target: string[][]) {
    const newArray: string[][] = JSON.parse(JSON.stringify(array));

    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[i].length; j++) {
            const card: string = target[i][j];
            const indexToRemove = newArray[i].indexOf(card);
            if (indexToRemove !== -1) {
                newArray[i].splice(indexToRemove, 1);
            }

            if (i == (target.length - 1)) {
                newArray[0].push(card);
            } else {
                newArray[i + 1].push(card);
            }
        }
    }
    return newArray;
}

export async function findAndMoveCardsInRightSide(array: string[][], target: string[][]) {
    const newArray: string[][] = JSON.parse(JSON.stringify(array));

    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[i].length; j++) {

            const card: string = target[i][j];
            const indexToRemove = newArray[i].indexOf(card);
            if (indexToRemove !== -1) {
                newArray[i].splice(indexToRemove, 1);
            }

            if (i == NUMERICAL.ZERO) {
                newArray[(target.length - 1)].push(card);
            } else {
                newArray[i - 1].push(card);
            }
        }
    }
    return newArray;
}

export async function findAndMoveCardsInAcrossSide(array: string[][], target: string[][]) {
    const newArray: string[][] = JSON.parse(JSON.stringify(array));

    for (let i = 0; i < target.length; i++) {
        for (let j = 0; j < target[i].length; j++) {

            const card: string = target[i][j];
            const indexToRemove = newArray[i].indexOf(card);
            if (indexToRemove !== -1) {
                newArray[i].splice(indexToRemove, 1);
            }

            if (i >= (target.length - 2)) {
                newArray[(i - 2)].push(card);
            } else {
                newArray[i + 2].push(card);
            }
        }
    }
    return newArray;
}

export async function formatCardMoveRes(array: string[][], target: string[][]) {
    const newArray: string[][] = JSON.parse(JSON.stringify(array));
    const resArray: cardMoveRes[][] = [];

    for (let i = 0; i < newArray.length; i++) {
        const element = newArray[i];
        const tempArray: cardMoveRes[] = [];
        for (let j = 0; j < element.length; j++) {
            const ele = element[j];
            const isAlready = target[i].includes(ele);
            tempArray.push({ card: ele, isAlready })
        }
        resArray.push(tempArray);
    }
    return resArray;
}

export function getCardNumber(card: string): number {
    const number =
        Number(card.split('-')[NUMERICAL.ONE]) === NUMERICAL.ONE ? NUMERICAL.THIRTEEN : Number(card.split('-')[NUMERICAL.ONE]);
    return number;
}

export function getPenaltyPoint(cards: string[]) {
    let penaltyPoint: number = NUMERICAL.ZERO;
    let spadePoint: number = NUMERICAL.ZERO;
    let heartPoint: number = NUMERICAL.ZERO;
    for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        let currentCardSequence = card.split('-')[0];
        let currentCardValue = card.split('-')[1];
        if (currentCardSequence === CARD_SEQUENCE.CARD_HEARTS) {
            penaltyPoint++;
            heartPoint++;
        }
        else if (currentCardSequence === CARD_SEQUENCE.CARD_SPADES && currentCardValue === `${NUMERICAL.TWELVE}`) {
            penaltyPoint = penaltyPoint + NUMERICAL.THIRTEEN;
            spadePoint = NUMERICAL.THIRTEEN;
        }
    }
    return { penaltyPoint, spadePoint, heartPoint };
}