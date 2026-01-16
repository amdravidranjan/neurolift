import NBackMemory from '../../app/exercises/n_back_memory';
import TaskJuggler from '../../app/exercises/task_juggler';
import ImpulseControl from '../../app/exercises/impulse_control';
import PatternMatrix from '../../app/exercises/pattern_matrix';
import SpatialRotator from '../../app/exercises/spatial_rotator';
import MentalWorkbench from '../../app/exercises/mental_workbench';
import DigitSpan from '../../app/exercises/digit_span';
import RuleShifter from '../../app/exercises/rule_shifter';
import TowerOfHanoi from '../../app/exercises/tower_of_hanoi';
import CrowdedRoom from '../../app/exercises/crowded_room';
import RsvpReader from '../../app/exercises/rsvp_reader';
// Import others as needed

export const COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
    'n_back_memory': NBackMemory,
    'task_juggler': TaskJuggler,
    'impulse_control': ImpulseControl,
    'pattern_matrix': PatternMatrix,
    'spatial_rotator': SpatialRotator,
    'mental_workbench': MentalWorkbench,
    'digit_span': DigitSpan,
    'rule_shifter': RuleShifter,
    'tower_of_hanoi': TowerOfHanoi,
    'crowded_room': CrowdedRoom,
    'rsvp_reader': RsvpReader,
};
