import { Component } from '@angular/core';
import { add, differenceInCalendarWeeks, differenceInWeeks, format, getMonth, getWeek, getYear, sub } from 'date-fns';
import { de } from 'date-fns/locale';

import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';


interface Project {
    name: string;
    startDate: Date;
    endDate: Date;
    planned?: boolean;
    probability?: number;
}

interface UserProject {
    username: string;
    projects: Array<Project>;
}

interface HeaderMonth {
    name: string;
    startCol: number;
    endCol: number;
    halfCol: boolean;
}

interface HeaderWeek {
    week: number;
    year: number;
}


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})



export class AppComponent {
    usersProjects: Array<UserProject> = [];

    viewStartDate: Date = new Date('2022-10-01');
    viewEndDate: Date = new Date('2023-12-31');
    viewHeaderWeeks: Array<HeaderWeek> = [];
    viewHeaderMonths: Array<HeaderMonth> = [];

    // viewWidth: number = 1280;
    viewGridColumnWidth: number = 20;
    viewGridRowHeight: number = 22;
    viewGridUserColumnWidth: number = 200;

    constructor() {
        this.usersProjects.push({
            username: 'Otto Waalkes',
            projects: [
                {
                    name: "VW Originals",
                    startDate: new Date('2023-02-01'),
                    endDate: new Date('2023-03-15')
                },
                {
                    name: "Herr der Ringe",
                    startDate: new Date('2023-01-10'),
                    endDate: new Date('2023-02-25'),
                    planned: true,
                    probability: 0.4
                }
            ]
        });

        this.usersProjects.push({
            username: 'Harald Schmidt',
            projects: [
                {
                    name: "BMW Losers",
                    startDate: new Date('2022-12-01'),
                    endDate: new Date('2023-01-10')
                }
            ]
        });


        this.buildViewHeaderMonths();
        this.buildViewHeaderWeeks();
    }


    viewDateRangeGetWeeks(later: Date = this.viewEndDate, earlier: Date = this.viewStartDate): number {
        let res: number = differenceInCalendarWeeks(later, earlier < this.viewStartDate ? this.viewStartDate : earlier, { weekStartsOn: 1, locale: de });
        res += earlier !== this.viewStartDate ? 1 : 0;

        if (res < 0) {
            res = 0;
        }
        // console.log("Range.... earlier:", earlier, " to later:", later, " in weeks: ", differenceInCalendarWeeks(later, earlier));

        return res;
    }

    getSequenceArray(count: number): Array<null> {
        return new Array<null>(count);
    }

    private buildViewHeaderMonths(): void {
        this.viewHeaderMonths = [];

        let actDate: Date = this.viewStartDate;
        let columnStart: number = 2;
        let columnEnd: number = 2;
        let prevDate: Date = this.viewStartDate;

        let weekChange: boolean = false;

        let element: HeaderMonth = {
            name: format(actDate, "MMMM", { locale: de }),
            startCol: columnStart,
            endCol: columnStart,
            halfCol: false
        };

        while (actDate < this.viewEndDate) {
            weekChange = getWeek(actDate, { weekStartsOn: 1, locale: de }) != getWeek(prevDate, { weekStartsOn: 1, locale: de });

            if (getMonth(actDate) != getMonth(prevDate)) {
                // Monatswechsel
                if (!weekChange) {
                    element.halfCol = true;
                }

                if (!this.viewHeaderMonths[this.viewHeaderMonths.length - 1]?.halfCol) {
                    columnEnd = element.halfCol ? columnEnd + 1 : columnEnd + 2;
                }
                else {
                    columnEnd = element.halfCol ? columnEnd : columnEnd + 1;
                }

                element.endCol = columnEnd;

                // console.log("Monatswechsel", actDate, element);
                this.viewHeaderMonths.push(element);


                columnStart = columnEnd;


                element = {
                    name: format(actDate, "MMMM", { locale: de }),
                    startCol: columnStart,
                    endCol: columnStart,
                    halfCol: false
                };
            }
            else if (weekChange) {
                // Wochenwechsel
                columnEnd += 2;
            }

            prevDate = actDate;
            actDate = add(actDate, { days: 1 });
        }

        element.endCol = columnEnd;
        this.viewHeaderMonths.push(element);
    }


    isCurrentWeek(headerWeek: HeaderWeek): boolean {
        let week: number = getWeek(Date.now(), { weekStartsOn: 1, locale: de });
        let year: number = getYear(Date.now());

        return headerWeek.week === week && headerWeek.year === year;
    }

    private buildViewHeaderWeeks(): void {
        this.viewHeaderWeeks = [];
        for (let date: Date = this.viewStartDate; date <= this.viewEndDate; date = add(date, { weeks: 1 })) {
            this.viewHeaderWeeks.push(
                {
                    week: getWeek(date, { weekStartsOn: 1, locale: de }),
                    year: getYear(date)
                }
            );
        }
    }

    getDateNow(): Date {
        return new Date(Date.now());
    }



    dropUserProject(event: CdkDragDrop<Array<UserProject>>) {
        moveItemInArray(this.usersProjects, event.previousIndex, event.currentIndex);
    }


    setViewStartDate(date: string) {
        this.viewStartDate = new Date(date);
        this.buildViewHeaderMonths();
        this.buildViewHeaderWeeks();
    }

    setViewEndDate(date: string) {
        this.viewEndDate = new Date(date);
        this.buildViewHeaderMonths();
        this.buildViewHeaderWeeks();
    }
}
