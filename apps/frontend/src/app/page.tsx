import { Button } from '@repo/ui/button';
import { Card } from '@repo/ui/card';

export default function Home() {
    return (
        <div className="p-6">
            <div>
                dot button(handledot){' '}
                <>
                    {' '}
                    <div>Add Quiz</div>
                    <div>Add Event</div>
                    <div>Add Hackthon</div>
                </>
            </div>
            <div>Featured Quizzes</div>
            <div>Featured Hackathons</div>
            <div>Featured Events</div>
        </div>
    );
}
