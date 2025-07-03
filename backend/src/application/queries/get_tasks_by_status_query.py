from dataclasses import dataclass


@dataclass
class GetTasksByStatusQuery:
    is_done: bool
    is_archived: bool
