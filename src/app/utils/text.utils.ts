import { TEXT_CONSTANTS } from '../constants/text.constants';

export class TextUtils {
  static getTextXPosition(textAnchor: string): number {
    return TEXT_CONSTANTS.PREVIEW.TEXT_POSITIONS[textAnchor as keyof typeof TEXT_CONSTANTS.PREVIEW.TEXT_POSITIONS] ||
           TEXT_CONSTANTS.PREVIEW.TEXT_POSITIONS.start;
  }

  static getDefaultLabelCustomization() {
    return {
      text: TEXT_CONSTANTS.DEFAULT_TEXT,
      color: TEXT_CONSTANTS.DEFAULT_COLOR,
      fontSize: TEXT_CONSTANTS.FONT_SIZE.DEFAULT,
      fontFamily: TEXT_CONSTANTS.FONT_FAMILIES[0].value,
      textAnchor: TEXT_CONSTANTS.TEXT_ANCHORS[0].value
    };
  }

  static extractTextPropertiesFromElement(element: any) {
    const attrs = element?.attributes || {};
    return {
      text: attrs['textContent'] || TEXT_CONSTANTS.DEFAULT_TEXT,
      color: attrs['fill'] || TEXT_CONSTANTS.DEFAULT_COLOR,
      fontSize: parseFloat(attrs['font-size'] || TEXT_CONSTANTS.FONT_SIZE.DEFAULT.toString()),
      fontFamily: attrs['font-family'] || TEXT_CONSTANTS.FONT_FAMILIES[0].value,
      textAnchor: attrs['text-anchor'] || TEXT_CONSTANTS.TEXT_ANCHORS[0].value
    };
  }
}
