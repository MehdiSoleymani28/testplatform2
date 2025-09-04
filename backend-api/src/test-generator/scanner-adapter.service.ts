import { Injectable } from '@nestjs/common';
import { ScanResultElement } from '../scanner/scanner.dto';

export interface TestGeneratorElement {
    type: string;
    id?: string;
    class?: string;
    text?: string;
    actionability?: {
        isVisible: boolean;
        isClickable: boolean;
    };
}

@Injectable()
export class ScannerAdapterService {
    adaptScanResults(elements: any[]): TestGeneratorElement[] {
        if (!Array.isArray(elements)) return [];
        return elements.map((element) => this.adaptElement(element));
    }

    private adaptElement(element: any): TestGeneratorElement {
        const adapted: TestGeneratorElement = {
            type: String(element?.type || 'body').toLowerCase(),
            actionability: {
                isVisible: Boolean(element?.actionability?.isVisible),
                isClickable: Boolean(element?.actionability?.isClickable),
            },
        };

        if (element?.id) {
            adapted.id = String(element.id).trim() || undefined;
        }

        if (element?.class) {
            const cls = element.class as any;
            let classStr: string | undefined;
            if (typeof cls === 'string') {
                classStr = cls;
            } else if (cls && typeof (cls as any).baseVal === 'string') {
                // SVGAnimatedString
                classStr = (cls as any).baseVal;
            }
            if (classStr) {
                adapted.class = classStr.trim().replace(/\s+/g, ' ');
            }
        }

        if (element?.text) {
            adapted.text = String(element.text).trim() || undefined;
        }

        return adapted;
    }
}

